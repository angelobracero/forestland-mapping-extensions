import { useEffect, useState } from "react";
import { getAppStore } from "jimu-core";
import {
  TextInput,
  Select,
  Option,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  enqueueNotification,
} from "jimu-ui";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import { LC_MAP_CATALOG_ITEM_ID } from "widgets/shared-code/content-config";
import { PHILIPPINE_REGIONS } from "widgets/shared-code/philippine-regions";
import { PROVINCES_BY_REGION } from "widgets/shared-code/philippine-provinces";

import {
  sectionStyle,
  sectionHeaderStyle,
  sectionTitleStyle,
  addButtonStyle,
  emptyStateStyle,
  rowListStyle,
  rowItemStyle,
  rowInfoStyle,
  rowTitleStyle,
  rowMetaStyle,
  rowActionsStyle,
  rowActionButtonStyle,
  deleteActionButtonStyle,
  formFieldStyle,
  formLabelStyle,
  nativeInputStyle,
  confirmDialogBodyStyle,
  uploadRowStyle,
  uploadButtonStyle,
  currentValueStyle,
  modalDialogStyle,
  MODAL_BELOW_HEADER_CLASS,
  modalBelowHeaderCss,
} from "../style";
import {
  uploadAndPublishShapefile,
  deletePortalItem,
  type PublishStage,
} from "../lc-map-publish";

type LcMapRow = {
  objectId: number;
  region: string;
  province: string;
  lcNumber: string;
  itemId: string;
  // ArcGIS username of whoever published this layer -- set once at publish
  // time, so removing it later can target that owner's account (needed
  // since deleting a real ArcGIS item requires the item's own owner or
  // org-admin rights, not just being a super admin in this app).
  owner: string;
};

const PUBLISH_STAGE_LABEL: Record<PublishStage, string> = {
  uploading: "Uploading shapefile...",
  publishing: "Publishing layer (this can take a minute)...",
  sharing: "Sharing with organization...",
};

const SHAPEFILE_ZIP_MIME_TYPES = ".zip,application/zip,application/x-zip-compressed";

export function LcMapsSection({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const [layer, setLayer] = useState<FeatureLayer | null>(null);
  const [rows, setRows] = useState<LcMapRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [region, setRegion] = useState("");
  const [province, setProvince] = useState("");
  const [lcNumber, setLcNumber] = useState("");
  const [layerName, setLayerName] = useState("");
  const [shapefile, setShapefile] = useState<File | null>(null);
  const [publishStage, setPublishStage] = useState<PublishStage | null>(null);
  const [saving, setSaving] = useState(false);

  const [pendingDeleteRow, setPendingDeleteRow] = useState<LcMapRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadRows = async (activeLayer: FeatureLayer) => {
    setLoading(true);
    setError(null);

    try {
      const query = activeLayer.createQuery();

      // Excludes any legacy soft-removed rows from before this table
      // stopped setting that flag -- deleting now removes the row outright
      // (see confirmDelete below), but old removed=1 rows may still exist.
      query.where = "removed IS NULL OR removed <> 1";
      query.outFields = ["*"];
      query.returnGeometry = false;

      const result = await activeLayer.queryFeatures(query);

      const items: LcMapRow[] = result.features.map((feature) => ({
        objectId: feature.attributes[activeLayer.objectIdField],
        region: feature.attributes.region ?? "",
        province: feature.attributes.province ?? "",
        lcNumber: feature.attributes.lc_number ?? "",
        itemId: feature.attributes.item_id ?? "",
        owner: feature.attributes.owner ?? "",
      }));

      setRows(items);
    } catch (loadError) {
      console.error("Failed to load LC Map catalog:", loadError);

      setError("Failed to load LC Maps.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const newLayer = new FeatureLayer({
        portalItem: { id: LC_MAP_CATALOG_ITEM_ID },
      });

      try {
        await newLayer.load();

        if (cancelled) return;

        setLayer(newLayer);

        await loadRows(newLayer);
      } catch (loadError) {
        if (cancelled) return;

        console.error("Failed to load LC Map catalog:", loadError);

        setError("Failed to load LC Maps.");
        setLoading(false);
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  const openAddForm = () => {
    setRegion("");
    setProvince("");
    setLcNumber("");
    setLayerName("");
    setShapefile(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;

    setIsFormOpen(false);
  };

  const handleSaveForm = async () => {
    if (!layer) return;

    if (!region.trim() || !province.trim() || !lcNumber.trim() || !layerName.trim()) {
      enqueueNotification({
        message: "Region, Province, LC Number, and Layer Name are all required.",
        severity: "error",
        placement: "bottom-left",
      });

      return;
    }

    if (!shapefile) {
      enqueueNotification({
        message: "Choose a zipped shapefile to publish.",
        severity: "error",
        placement: "bottom-left",
      });

      return;
    }

    setSaving(true);

    try {
      const { itemId } = await uploadAndPublishShapefile(
        shapefile,
        layerName.trim(),
        setPublishStage,
      );

      const currentUsername = getAppStore().getState().portalSelf?.user?.username ?? "";

      const result = await layer.applyEdits({
        addFeatures: [
          {
            attributes: {
              region: region.trim(),
              province: province.trim(),
              lc_number: lcNumber.trim(),
              item_id: itemId,
              owner: currentUsername,
              removed: 0,
            },
          },
        ],
      });

      const failed = result.addFeatureResults?.find((r) => r.error);

      if (failed?.error) {
        throw failed.error;
      }

      enqueueNotification({
        message: "LC Map published and added.",
        severity: "success",
        placement: "bottom-left",
      });

      setIsFormOpen(false);

      await loadRows(layer);
    } catch (saveError) {
      console.error("Failed to publish LC Map:", saveError);

      enqueueNotification({
        message:
          saveError instanceof Error
            ? saveError.message
            : "Failed to publish LC Map.",
        severity: "error",
        placement: "bottom-left",
      });
    } finally {
      setSaving(false);
      setPublishStage(null);
    }
  };

  const requestDelete = (row: LcMapRow) => {
    setPendingDeleteRow(row);
  };

  const cancelDelete = () => {
    if (deleting) return;

    setPendingDeleteRow(null);
  };

  // Permanently deletes the real ArcGIS item first (targeting its owner's
  // account -- see deletePortalItem), then removes the catalog row. Done in
  // that order deliberately: if the ArcGIS delete fails (e.g. the signed-in
  // super admin isn't that item's owner and isn't an org admin either), the
  // catalog row is left in place rather than pointing at a promise that
  // never happened -- a stray still-published layer with no catalog row is
  // a far smaller problem than a catalog row pointing at nothing.
  const confirmDelete = async () => {
    if (!layer || !pendingDeleteRow) return;

    setDeleting(true);

    try {
      await deletePortalItem(pendingDeleteRow.owner, pendingDeleteRow.itemId);

      const result = await layer.applyEdits({
        deleteFeatures: [{ objectId: pendingDeleteRow.objectId }],
      });

      const failed = result.deleteFeatureResults?.find(
        (r) => r.objectId === pendingDeleteRow.objectId && r.error,
      );

      if (failed?.error) {
        throw failed.error;
      }

      enqueueNotification({
        message: "LC Map deleted permanently.",
        severity: "success",
        placement: "bottom-left",
      });

      setPendingDeleteRow(null);

      await loadRows(layer);
    } catch (deleteError) {
      console.error("Failed to delete LC Map:", deleteError);

      enqueueNotification({
        message:
          deleteError instanceof Error
            ? deleteError.message
            : "Failed to delete LC Map.",
        severity: "error",
        placement: "bottom-left",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div css={sectionStyle}>
      <div css={sectionHeaderStyle}>
        <h3 css={sectionTitleStyle}>LC Maps</h3>
        <button type="button" css={addButtonStyle} onClick={openAddForm}>
          + Add New
        </button>
      </div>

      {loading ? (
        <div css={emptyStateStyle}>Loading...</div>
      ) : error ? (
        <div css={emptyStateStyle}>{error}</div>
      ) : rows.length === 0 ? (
        <div css={emptyStateStyle}>
          No LC Maps have been added yet. Click "+ Add New" to publish one.
        </div>
      ) : (
        <div css={rowListStyle}>
          {rows.map((row) => (
            <div key={row.objectId} css={rowItemStyle}>
              <div css={rowInfoStyle}>
                <span css={rowTitleStyle}>
                  {row.region} · {row.province} · {row.lcNumber}
                </span>
                <span css={rowMetaStyle}>{row.itemId}</span>
              </div>
              {/* Deleting now permanently removes the real ArcGIS item
                  (see confirmDelete), so it's limited to super admins --
                  a content admin can still see every LC Map here, just not
                  delete one. */}
              {isSuperAdmin && (
                <div css={rowActionsStyle}>
                  <button
                    type="button"
                    css={[rowActionButtonStyle, deleteActionButtonStyle]}
                    onClick={() => requestDelete(row)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ADD FORM */}
      <style>{modalBelowHeaderCss}</style>

      <Modal
        isOpen={isFormOpen}
        toggle={closeForm}
        centered
        css={modalDialogStyle}
        modalClassName={MODAL_BELOW_HEADER_CLASS}
      >
        <ModalHeader toggle={closeForm}>Publish a new LC Map</ModalHeader>
        <ModalBody>
          <div css={formFieldStyle}>
            <label css={formLabelStyle}>Region</label>
            <Select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="Select a Region"
            >
              {PHILIPPINE_REGIONS.map((regionOption) => (
                <Option key={regionOption} value={regionOption}>
                  {regionOption}
                </Option>
              ))}
            </Select>
          </div>

          <div css={formFieldStyle}>
            <label css={formLabelStyle}>Province</label>
            <Select
              value={PROVINCES_BY_REGION[region]?.includes(province) ? province : ""}
              onChange={(e) => setProvince(e.target.value)}
              placeholder="Select a Province"
            >
              {(PROVINCES_BY_REGION[region] ?? []).map((provinceOption) => (
                <Option key={provinceOption} value={provinceOption}>
                  {provinceOption}
                </Option>
              ))}
            </Select>
            {/* Still free text -- a proposed map can span more than one
                province, so picking from the list above isn't required. */}
            <TextInput
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              placeholder="Or type a custom value / combination, e.g. Sorsogon-Albay"
            />
          </div>

          <div css={formFieldStyle}>
            <label css={formLabelStyle}>LC Number</label>
            <TextInput value={lcNumber} onChange={(e) => setLcNumber(e.target.value)} />
          </div>

          <div css={formFieldStyle}>
            <label css={formLabelStyle}>Layer Name</label>
            <TextInput
              value={layerName}
              onChange={(e) => setLayerName(e.target.value)}
              placeholder="Name for the new hosted feature layer in ArcGIS Online"
            />
          </div>

          <div css={formFieldStyle}>
            <label css={formLabelStyle}>Shapefile (.zip)</label>
            <div css={uploadRowStyle}>
              <div style={{ flex: 1 }}>
                <div css={currentValueStyle}>
                  {saving && publishStage
                    ? PUBLISH_STAGE_LABEL[publishStage]
                    : shapefile?.name || "No file chosen yet."}
                </div>
              </div>

              <label css={uploadButtonStyle}>
                Choose File
                <input
                  type="file"
                  accept={SHAPEFILE_ZIP_MIME_TYPES}
                  style={{ display: "none" }}
                  disabled={saving}
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    e.target.value = "";

                    if (file) setShapefile(file);
                  }}
                />
              </label>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="default" onClick={closeForm} disabled={saving}>
            Cancel
          </Button>
          <Button type="primary" onClick={handleSaveForm} disabled={saving}>
            {saving ? "Publishing..." : "Publish"}
          </Button>
        </ModalFooter>
      </Modal>

      {/* DELETE CONFIRMATION */}
      <Modal
        isOpen={pendingDeleteRow !== null}
        toggle={cancelDelete}
        centered
        css={modalDialogStyle}
        modalClassName={MODAL_BELOW_HEADER_CLASS}
      >
        <ModalHeader toggle={cancelDelete}>Delete LC Map</ModalHeader>
        <ModalBody>
          <p css={confirmDialogBodyStyle}>
            Permanently delete this LC Map? This deletes the actual published
            layer in ArcGIS Online, not just this entry -- it cannot be
            undone.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button type="default" onClick={cancelDelete} disabled={deleting}>
            Cancel
          </Button>
          <Button type="danger" onClick={confirmDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete Permanently"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
