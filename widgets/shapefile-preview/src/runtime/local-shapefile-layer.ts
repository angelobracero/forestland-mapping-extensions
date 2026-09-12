import shp from "shpjs";
import { geojsonToArcGIS } from "@terraformer/arcgis";
import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";
import Multipoint from "@arcgis/core/geometry/Multipoint";
import Polyline from "@arcgis/core/geometry/Polyline";
import Polygon from "@arcgis/core/geometry/Polygon";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import type Geometry from "@arcgis/core/geometry/Geometry";

// Parses a zipped shapefile entirely in the browser (shpjs) and builds a
// client-side FeatureLayer straight from the parsed features, kept only in
// this tab's memory. Nothing here leaves the browser -- no upload, no
// publish, no write to this organization's ArcGIS. The caller adds the
// returned layer directly to the live map view (not the web map's saved
// configuration), so it's visible only to this visitor and disappears on
// refresh/navigation.
//
// Deliberately avoids GeoJSONLayer: it only accepts a `url` to fetch from,
// so the usual way to feed it local data is JSON.stringify-ing the whole
// parsed shapefile into one Blob/URL -- for a large shapefile (e.g. a
// whole region) that string can exceed the JS engine's max string length
// (GeoJSONLayer hits the same ceiling again on its end, parsing that text
// back in a worker, so chunking the Blob doesn't help either). Building a
// FeatureLayer straight from in-memory Graphics never needs the dataset to
// exist as one string at all.
const OBJECT_ID_FIELD = "OBJECTID";

// Esri's static fromJSON methods rely on `this` being the class itself (they
// do `new this(...)` internally) -- wrapped in arrow functions here instead
// of referenced directly, since pulling them into this lookup object would
// otherwise call them with the wrong `this`.
const ESRI_GEOMETRY_CLASS_BY_JSON_KEY = [
  { key: "x", build: (json: Record<string, any>) => Point.fromJSON(json) },
  { key: "points", build: (json: Record<string, any>) => Multipoint.fromJSON(json) },
  { key: "paths", build: (json: Record<string, any>) => Polyline.fromJSON(json) },
  { key: "rings", build: (json: Record<string, any>) => Polygon.fromJSON(json) },
] as const;

function geometryFromEsriJSON(json: Record<string, any>): Geometry {
  const match = ESRI_GEOMETRY_CLASS_BY_JSON_KEY.find(({ key }) => key in json);

  if (!match) {
    throw new Error("Unsupported geometry type in that shapefile.");
  }

  return match.build(json);
}

// Field type isn't known from GeoJSON (it has no schema) -- inferred here
// from a sample value per attribute, same as a human would guess it.
function inferFieldType(value: unknown): "integer" | "double" | "string" {
  if (typeof value === "number") {
    return Number.isInteger(value) ? "integer" : "double";
  }

  return "string";
}

export async function createLocalShapefileLayer(file: File): Promise<FeatureLayer> {
  const arrayBuffer = await file.arrayBuffer();
  const parsed = await shp(arrayBuffer);

  // A shapefile zip can in principle bundle more than one layer; shpjs
  // returns an array in that case. Only the first is shown -- a proposed
  // map's shapefile is expected to be a single layer.
  const featureCollection = Array.isArray(parsed) ? parsed[0] : parsed;

  if (!featureCollection?.features?.length) {
    throw new Error("No features found in that shapefile.");
  }

  // Every attribute name that appears on any feature, each mapped to one
  // non-null sample value -- used below to build the layer's field list.
  const sampleValueByFieldName = new Map<string, unknown>();

  for (const feature of featureCollection.features) {
    for (const [name, value] of Object.entries(feature.properties ?? {})) {
      if (value !== null && value !== undefined && !sampleValueByFieldName.has(name)) {
        sampleValueByFieldName.set(name, value);
      }
    }
  }

  const graphics = featureCollection.features.map((feature: any, index: number) => {
    // geojsonToArcGIS handles the parts that are easy to get wrong by hand
    // -- e.g. GeoJSON and Esri JSON expect opposite polygon ring-winding
    // order for holes vs. exteriors.
    const converted = geojsonToArcGIS(feature, OBJECT_ID_FIELD) as {
      geometry?: Record<string, any>;
      attributes: Record<string, any>;
    };

    // Shapefiles have no natural row id; geojsonToArcGIS only fills
    // OBJECTID in from a GeoJSON feature's own `id`, which shpjs doesn't
    // set, so it's assigned here instead -- FeatureLayer requires one.
    converted.attributes[OBJECT_ID_FIELD] ??= index + 1;

    return new Graphic({
      geometry: converted.geometry ? geometryFromEsriJSON(converted.geometry) : undefined,
      attributes: converted.attributes,
    });
  });

  const fields = [
    { name: OBJECT_ID_FIELD, alias: OBJECT_ID_FIELD, type: "oid" as const },
    ...Array.from(sampleValueByFieldName, ([name, sampleValue]) => ({
      name,
      alias: name,
      type: inferFieldType(sampleValue),
      length: 255,
    })),
  ];

  // Every graphic here was built from the same shapefile, so they all share
  // one geometry type -- never "extent"/"mesh"/"multipatch" (the only other
  // types a generic Geometry could report), which is all FeatureLayer
  // accepts here.
  const geometryType = graphics[0].geometry?.type as
    | "point"
    | "polygon"
    | "polyline"
    | "multipoint";

  return new FeatureLayer({
    source: graphics,
    fields,
    objectIdField: OBJECT_ID_FIELD,
    geometryType,
    spatialReference: { wkid: 4326 },
    title: file.name.replace(/\.zip$/i, ""),
  });
}
