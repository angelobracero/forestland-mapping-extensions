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
import { PROVINCES_BY_REGION } from "../philippine-provinces";

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
  editActionButtonStyle,
  deleteActionButtonStyle,
  formFieldStyle,
  formLabelStyle,
  nativeInputStyle,
  confirmDialogBodyStyle,
  uploadRowStyle,
  uploadButtonStyle,
  currentValueStyle,
} from "../style";
import { uploadAndPublishShapefile, type PublishStage } from "../lc-map-publish";

type LcMapRow = {
  objectId: number;
  region: string;
  province: string;
  lcNumber: string;
  itemId: string;
  // ArcGIS username of whoever published this layer -- set once at publish
  // time, so a super admin can see who owns it (needed since deleting the
  // real ArcGIS item later requires that owner's account or org-admin
  // rights, not just being a super admin in this app).
  owner: string;
  // Soft-delete flag: hides the entry from the public LC Map filter without
  // touching the real published layer. Only super admins see removed
  // entries (below), and only here in this app -- the underlying ArcGIS
  // item is untouched either way.
  removed: boolean;
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

      query.where = "1=1";
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
        removed: Number(feature.attributes.removed) === 1,
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

  // Soft delete: only flips `removed` on the catalog row, so it stops
  // showing up on the public site -- deliberately does NOT delete the
  // published hosted feature layer itself. That's a separate, harder-to-
  // reverse action on a real ArcGIS item, gated to super admins below (see
  // the "Removed LC Maps" section), and it needs the item's actual owner
  // account or ArcGIS org-admin rights to succeed at all.
  const confirmDelete = async () => {
    if (!layer || !pendingDeleteRow) return;

    setDeleting(true);

    try {
      const result = await layer.applyEdits({
        updateFeatures: [
          {
            attributes: {
              [layer.objectIdField]: pendingDeleteRow.objectId,
              removed: 1,
            },
          },
        ],
      });

      const failed = result.updateFeatureResults?.find(
        (r) => r.objectId === pendingDeleteRow.objectId && r.error,
      );

      if (failed?.error) {
        throw failed.error;
      }

      enqueueNotification({
        message: "LC Map removed from the public site.",
        severity: "success",
        placement: "bottom-left",
      });

      setPendingDeleteRow(null);

      await loadRows(layer);
    } catch (deleteError) {
      console.error("Failed to remove LC Map catalog entry:", deleteError);

      enqueueNotification({
        message: "Failed to remove LC Map.",
        severity: "error",
        placement: "bottom-left",
      });
    } finally {
      setDeleting(false);
    }
  };

  const restoreRow = async (row: LcMapRow) => {
    if (!layer) return;

    try {
      const result = await layer.applyEdits({
        updateFeatures: [
          { attributes: { [layer.objectIdField]: row.objectId, removed: 0 } },
        ],
      });

      const failed = result.updateFeatureResults?.find(
        (r) => r.objectId === row.objectId && r.error,
      );

      if (failed?.error) {
        throw failed.error;
      }

      enqueueNotification({
        message: "LC Map restored to the public site.",
        severity: "success",
        placement: "bottom-left",
      });

      await loadRows(layer);
    } catch (restoreError) {
      console.error("Failed to restore LC Map catalog entry:", restoreError);

      enqueueNotification({
        message: "Failed to restore LC Map.",
        severity: "error",
        placement: "bottom-left",
      });
    }
  };

  const activeRows = rows.filter((row) => !row.removed);
  const removedRows = rows.filter((row) => row.removed);
  const portalUrl = (getAppStore().getState().portalUrl || "https://www.arcgis.com").replace(
    /\/$/,
    "",
  );

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
      ) : activeRows.length === 0 ? (
        <div css={emptyStateStyle}>
          No LC Maps have been added yet. Click "+ Add New" to publish one.
        </div>
      ) : (
        <div css={rowListStyle}>
          {activeRows.map((row) => (
            <div key={row.objectId} css={rowItemStyle}>
              <div css={rowInfoStyle}>
                <span css={rowTitleStyle}>
                  {row.region} · {row.province} · {row.lcNumber}
                </span>
                <span css={rowMetaStyle}>{row.itemId}</span>
              </div>
              <div css={rowActionsStyle}>
                <button
                  type="button"
                  css={[rowActionButtonStyle, deleteActionButtonStyle]}
                  onClick={() => requestDelete(row)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isSuperAdmin && (
        <div css={sectionStyle}>
          <div css={sectionHeaderStyle}>
            <h3 css={sectionTitleStyle}>Removed LC Maps</h3>
          </div>

          {removedRows.length === 0 ? (
            <div css={emptyStateStyle}>Nothing removed right now.</div>
          ) : (
            <div css={rowListStyle}>
              {removedRows.map((row) => (
                <div key={row.objectId} css={rowItemStyle}>
                  <div css={rowInfoStyle}>
                    <span css={rowTitleStyle}>
                      {row.region} · {row.province} · {row.lcNumber}
                    </span>
                    <span css={rowMetaStyle}>
                      {row.itemId} · Published by: {row.owner || "unknown"}
                    </span>
                  </div>
                  <div css={rowActionsStyle}>
                    <a
                      css={[rowActionButtonStyle, editActionButtonStyle]}
                      href={`${portalUrl}/home/item.html?id=${row.itemId}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View in ArcGIS
                    </a>
                    <button
                      type="button"
                      css={[rowActionButtonStyle, editActionButtonStyle]}
                      onClick={() => restoreRow(row)}
                    >
                      Restore
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ADD FORM */}
      <Modal isOpen={isFormOpen} toggle={closeForm} centered>
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
      <Modal isOpen={pendingDeleteRow !== null} toggle={cancelDelete} centered>
        <ModalHeader toggle={cancelDelete}>Remove LC Map</ModalHeader>
        <ModalBody>
          <p css={confirmDialogBodyStyle}>
            Remove this entry from the public site? It stops appearing in the
            LC Map filter -- the published layer itself stays in ArcGIS
            Online, and a super admin can restore this entry later.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button type="default" onClick={cancelDelete} disabled={deleting}>
            Cancel
          </Button>
          <Button type="danger" onClick={confirmDelete} disabled={deleting}>
            {deleting ? "Removing..." : "Remove"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
