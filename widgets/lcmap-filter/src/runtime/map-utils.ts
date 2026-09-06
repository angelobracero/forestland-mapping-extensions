import type FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import type { JimuMapView } from "jimu-arcgis";

// Registers an ArcGIS JS API layer as an Experience Builder data source, so
// other widgets (filters, tables, etc.) can see it. Experience Builder only
// creates the JimuLayerView asynchronously after the layer is added to the
// map, so this waits for it (with a safety timeout) before creating the
// data source.
export async function ensureLayerDataSource(
  layer: FeatureLayer,
  jimuMapView: JimuMapView | null,
): Promise<void> {
  if (!jimuMapView) {
    console.warn(
      "Cannot create data source because JimuMapView is unavailable.",
    );

    return;
  }

  try {
    let jimuLayerView = jimuMapView.getJimuLayerViewByAPILayer(layer);

    if (!jimuLayerView) {
      await new Promise<void>((resolve) => {
        let finished = false;

        const listener = (createdLayerView: any) => {
          if (createdLayerView?.layer === layer) {
            jimuLayerView = createdLayerView;

            if (!finished) {
              finished = true;

              jimuMapView.removeJimuLayerViewCreatedListener(listener);

              resolve();
            }
          }
        };

        jimuMapView.addJimuLayerViewCreatedListener(listener);

        // Safety timeout
        setTimeout(() => {
          if (!finished) {
            finished = true;

            jimuMapView.removeJimuLayerViewCreatedListener(listener);

            resolve();
          }
        }, 10000);
      });
    }

    if (!jimuLayerView) {
      jimuLayerView = jimuMapView.getJimuLayerViewByAPILayer(layer);
    }

    if (!jimuLayerView) {
      console.warn("JimuLayerView could not be created:", layer.title);

      return;
    }

    let dataSource = jimuLayerView.getLayerDataSource();

    if (!dataSource) {
      dataSource = await jimuLayerView.createLayerDataSource();
    }

    if (!dataSource) {
      console.warn("No data source was created for:", layer.title);

      return;
    }
  } catch (error) {
    console.error(
      "Failed to create Experience Builder data source for:",
      layer.title,
      error,
    );
  }
}
