import { type AllWidgetProps } from "jimu-core";
import { useEffect, useState } from "react";
import { enqueueNotification } from "jimu-ui";
import { JimuMapViewComponent, type JimuMapView } from "jimu-arcgis";
import type Map from "@arcgis/core/Map";
import {
  addLocalLayer,
  subscribeToLocalLayers,
} from "widgets/shared-code/local-layers-store";
import { createLocalShapefileLayer } from "./local-shapefile-layer";
import { previewButtonStyle, previewButtonLabelStyle, previewButtonSubtitleStyle } from "./style";

// Lets a site visitor add their own zipped shapefile(s) to the map -- entirely
// in their own browser. Each layer is added straight to the live map view,
// never written into the web map's saved configuration, so no one else ever
// sees it and it's gone as soon as this tab is closed or refreshed. Nothing
// is uploaded, published, or sent to this organization's ArcGIS at any
// point.
//
// This widget only tracks a running count -- the actual list (with zoom/
// remove) lives in the separate local-layers-list widget, which reads the
// same widgets/shared-code/local-layers-store this one writes to.
function Widget(props: AllWidgetProps<any>) {
  const [jimuMapView, setJimuMapView] = useState<JimuMapView | null>(null);
  const [loading, setLoading] = useState(false);
  const [addedCount, setAddedCount] = useState(0);

  useEffect(
    () =>
      subscribeToLocalLayers((layers) =>
        setAddedCount(layers.filter((item) => item.removable).length),
      ),
    [],
  );

  const handleActiveViewChange = (mapView: JimuMapView) => {
    setJimuMapView(mapView);
  };

  const handleFileChange = async (file: File) => {
    const map = jimuMapView?.view?.map as Map | undefined;

    if (!map) {
      enqueueNotification({
        message: "The map isn't ready yet -- try again in a moment.",
        severity: "error",
        placement: "bottom-left",
      });

      return;
    }

    setLoading(true);

    try {
      const layer = await createLocalShapefileLayer(file);

      // Inserted at the very bottom (index 0) instead of appended on top --
      // map.add's default -- so a visitor's own shapefile never covers the
      // official LC map or its comments, regardless of whether it was added
      // before or after them.
      map.add(layer, 0);
      addLocalLayer({ id: layer.id, label: file.name, layer });

      await layer.load();

      if (layer.fullExtent) {
        await jimuMapView?.view?.goTo(layer.fullExtent.expand(1.2));
      }

      enqueueNotification({
        message: "Shapefile added to the map (visible only to you).",
        severity: "success",
        placement: "bottom-left",
      });
    } catch (error) {
      console.error("Failed to add local shapefile:", error);

      enqueueNotification({
        message:
          error instanceof Error ? error.message : "Could not read that shapefile.",
        severity: "error",
        placement: "bottom-left",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <JimuMapViewComponent
        useMapWidgetId={props.useMapWidgetIds?.[0]}
        onActiveViewChange={handleActiveViewChange}
      />

      <label
        css={previewButtonStyle}
        className="jimu-widget"
        style={{ cursor: loading ? "default" : "pointer" }}
      >
        <span css={previewButtonLabelStyle}>
          {loading ? "Reading shapefile..." : "Add Own Layer"}
        </span>
        {addedCount > 0 && !loading && (
          <span css={previewButtonSubtitleStyle}>
            {addedCount} layer{addedCount > 1 ? "s" : ""} added
          </span>
        )}
        <input
          type="file"
          accept=".zip,application/zip,application/x-zip-compressed"
          style={{ display: "none" }}
          disabled={loading}
          onChange={(e) => {
            const file = e.target.files?.[0];

            e.target.value = "";

            if (file) handleFileChange(file);
          }}
        />
      </label>
    </>
  );
}

export default Widget;
