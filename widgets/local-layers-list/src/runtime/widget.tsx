import { type AllWidgetProps } from "jimu-core";
import { useEffect, useState } from "react";
import { enqueueNotification } from "jimu-ui";
import { JimuMapViewComponent, type JimuMapView } from "jimu-arcgis";
import type Map from "@arcgis/core/Map";
import {
  type LocalLayerRecord,
  removeLocalLayer,
  subscribeToLocalLayers,
} from "widgets/shared-code/local-layers-store";
import {
  listContainerStyle,
  titleStyle,
  rowListStyle,
  emptyStateStyle,
  layerRowStyle,
  layerNameButtonStyle,
  removeLinkStyle,
} from "./style";

// Displays whatever local shapefiles have been added via the
// shapefile-preview widget (shared through widgets/shared-code/
// local-layers-store), so the button and this list can be placed
// independently anywhere on the page -- e.g. the button above the Editor,
// this list below it.
function Widget(props: AllWidgetProps<any>) {
  const [jimuMapView, setJimuMapView] = useState<JimuMapView | null>(null);
  const [layers, setLayers] = useState<LocalLayerRecord[]>([]);

  useEffect(() => subscribeToLocalLayers(setLayers), []);

  const handleActiveViewChange = (mapView: JimuMapView) => {
    setJimuMapView(mapView);
  };

  const handleZoomTo = async (record: LocalLayerRecord) => {
    const extent = record.layer.fullExtent;

    if (!extent) {
      enqueueNotification({
        message: "That layer isn't ready to zoom to yet -- try again in a moment.",
        severity: "warning",
        placement: "bottom-left",
      });

      return;
    }

    await jimuMapView?.view?.goTo(extent.expand(1.2));
  };

  const handleRemove = (record: LocalLayerRecord) => {
    const map = jimuMapView?.view?.map as Map | undefined;

    if (map) {
      map.remove(record.layer);
    }

    removeLocalLayer(record.id);
  };

  return (
    <>
      <JimuMapViewComponent
        useMapWidgetId={props.useMapWidgetIds?.[0]}
        onActiveViewChange={handleActiveViewChange}
      />

      <div css={listContainerStyle} className="jimu-widget">
        <div css={titleStyle}>Layers on Map</div>

        <div css={rowListStyle}>
          {layers.length === 0 ? (
            <div css={emptyStateStyle}>No layers added yet.</div>
          ) : (
            layers.map((record) => (
              <div key={record.id} css={layerRowStyle}>
                <button
                  type="button"
                  css={layerNameButtonStyle}
                  onClick={() => handleZoomTo(record)}
                  title="Zoom to this layer"
                >
                  {record.label}
                </button>
                {record.removable && (
                  <button
                    type="button"
                    css={removeLinkStyle}
                    onClick={() => handleRemove(record)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default Widget;
