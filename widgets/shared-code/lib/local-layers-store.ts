import type Layer from "@arcgis/core/layers/Layer";

// In-memory, browser-only registry of layers currently on the map that a
// visitor might want to zoom to from the local-layers-list widget:
// - shapefiles the visitor added themselves (shapefile-preview) -- removable
// - the one official LC map currently loaded by lcmap-filter -- zoom only,
//   not removable, since it's not the visitor's to remove
// Lives only in this tab's memory -- nothing here is persisted, uploaded, or
// shared with other visitors. widgets/shared-code entries are loaded once
// and shared at runtime across every widget that imports them, so this one
// module instance is what lets independent widgets stay in sync.
export type LocalLayerRecord = {
  id: string;
  label: string;
  layer: Layer;
  removable: boolean;
};

type Listener = (layers: LocalLayerRecord[]) => void;

// Fixed id for the filter's one current LC map entry -- registering a new
// one always replaces whatever was there before, since only one LC map is
// loaded at a time.
const CURRENT_LC_MAP_ID = "current-lc-map";

let layers: LocalLayerRecord[] = [];
const listeners = new Set<Listener>();

function notify(): void {
  listeners.forEach((listener) => listener(layers));
}

export function addLocalLayer(record: Omit<LocalLayerRecord, "removable">): void {
  layers = [...layers, { ...record, removable: true }];
  notify();
}

export function removeLocalLayer(id: string): void {
  layers = layers.filter((item) => item.id !== id);
  notify();
}

// Registers (or replaces, or clears with `null`) the filter's current LC
// map layer, so it shows up in local-layers-list too -- zoomable, but not
// removable from there.
export function setCurrentLcMapLayer(
  record: { label: string; layer: Layer } | null,
): void {
  layers = layers.filter((item) => item.id !== CURRENT_LC_MAP_ID);

  if (record) {
    layers = [
      ...layers,
      { id: CURRENT_LC_MAP_ID, label: record.label, layer: record.layer, removable: false },
    ];
  }

  notify();
}

// Calls `listener` immediately with the current list, then again on every
// change. Returns an unsubscribe function -- call it in a useEffect cleanup.
export function subscribeToLocalLayers(listener: Listener): () => void {
  listeners.add(listener);
  listener(layers);

  return () => {
    listeners.delete(listener);
  };
}
