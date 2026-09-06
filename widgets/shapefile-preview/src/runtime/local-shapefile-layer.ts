import shp from "shpjs";
import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer";

// Parses a zipped shapefile entirely in the browser (shpjs) and wraps the
// result in a GeoJSONLayer built from a local blob URL. Nothing here leaves
// the browser -- no upload, no publish, no write to this organization's
// ArcGIS. The caller adds the returned layer directly to the live map view
// (not the web map's saved configuration), so it's visible only to this
// visitor and disappears on refresh/navigation.
export async function createLocalShapefileLayer(file: File): Promise<GeoJSONLayer> {
  const arrayBuffer = await file.arrayBuffer();
  const parsed = await shp(arrayBuffer);

  // A shapefile zip can in principle bundle more than one layer; shpjs
  // returns an array in that case. Only the first is shown -- a proposed
  // map's shapefile is expected to be a single layer.
  const featureCollection = Array.isArray(parsed) ? parsed[0] : parsed;

  if (!featureCollection) {
    throw new Error("No features found in that shapefile.");
  }

  const blob = new Blob([JSON.stringify(featureCollection)], {
    type: "application/json",
  });
  const blobUrl = URL.createObjectURL(blob);

  return new GeoJSONLayer({
    url: blobUrl,
    title: file.name.replace(/\.zip$/i, ""),
  });
}
