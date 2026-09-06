// The one hosted feature layer item backing the public content tables --
// GAD activities (layer 0), LCD in Action media (layer 1), and About AVPs
// (layer 2). Shared by content-admin (writes) and gad-gallery/lcd-in-action/
// about (read-only display).
export const CONTENT_ITEM_ID = "046175d794954d6caa4f5096fa1ecbd6";

// The catalog table mapping each Region/Province/LC Number combination to
// the item id of that specific proposed LC map's hosted feature layer.
// Shared by lcmap-filter (reads it to populate the filter dropdowns) and
// content-admin (writes a new row after publishing a new LC map).
export const LC_MAP_CATALOG_ITEM_ID = "7fb9324349ae4c01b4efcb06d09e79ce";
