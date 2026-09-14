import { useEffect, useState } from "react";
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
import { LoadingOverlay } from "widgets/shared-code/LoadingOverlay";

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
  rowMetaLinkStyle,
  rowActionsStyle,
  rowActionButtonStyle,
  deleteActionButtonStyle,
  formFieldStyle,
  formLabelStyle,
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
  getItemOwner,
  getPortalUrl,
  type PublishStage,
} from "../lc-map-publish";

type LcMapRow = {
  objectId: number;
  region: string;
  province: string;
  lcNumber: string;
  itemId: string;
};

const PUBLISH_STAGE_LABEL: Record<PublishStage, string> = {
  uploading: "Uploading shapefile...",
  publishing: "Publishing layer (this can take a minute)...",
  sharing: "Sharing with organization...",
};

const SHAPEFILE_ZIP_MIME_TYPES = ".zip,application/zip,application/x-zip-compressed";

// Strips everything but letters/digits -- ArcGIS's published *service* name
// (as opposed to the freely-formatted item title) doesn't allow spaces or
// most punctuation, and Province names (e.g. "Metro Manila", "Las Piñas")
// have both, so this guarantees a safe name regardless. Accented letters
// (e.g. the ñ in "Las Piñas") are normalized to their plain equivalent
// first (ñ -> n) rather than just dropped -- NFD normalization splits an
// accented character into its base letter plus a separate combining
// accent mark, so stripping the accent mark alone leaves the plain letter
// behind instead of losing it entirely.
function toSafeNamePart(value: string): string {
  return value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "");
}

// Auto-derived instead of a free-text field an admin has to keep unique by
// hand -- since it's built from LC Number + Province, and handleSaveForm's
// own duplicate check already guarantees that combination is unique in the
// catalog, this can't collide with another entry published from this form.
function buildLayerName(lcNumber: string, province: string): string {
  return `LC${toSafeNamePart(lcNumber)}_${toSafeNamePart(province)}`;
}

export function LcMapsSection() {
  const [layer, setLayer] = useState<FeatureLayer | null>(null);
  const [rows, setRows] = useState<LcMapRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [region, setRegion] = useState("");
  const [province, setProvince] = useState("");
  const [lcNumber, setLcNumber] = useState("");
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
      // Newest first, so a just-added LC Map shows up at the top instead
      // of the bottom of a potentially long, scrolled list.
      query.orderByFields = [`${activeLayer.objectIdField} DESC`];

      const result = await activeLayer.queryFeatures(query);

      const items: LcMapRow[] = result.features.map((feature) => ({
        objectId: feature.attributes[activeLayer.objectIdField],
        region: feature.attributes.region ?? "",
        province: feature.attributes.province ?? "",
        lcNumber: feature.attributes.lc_number ?? "",
        itemId: feature.attributes.item_id ?? "",
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
    setShapefile(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;

    setIsFormOpen(false);
  };

  const handleSaveForm = async () => {
    if (!layer) return;

    if (!region.trim() || !province.trim() || !lcNumber.trim()) {
      enqueueNotification({
        message: "Region, Province, and LC Number are all required.",
        severity: "error",
        placement: "bottom-left",
      });

      return;
    }

    // Catches this before spending an upload+publish on it, rather than
    // letting ArcGIS reject the catalog row afterward with an opaque
    // "Database error has occurred" (see LC_MAP_CATALOG_ITEM_ID's row
    // history) and leaving a real ArcGIS item published with no catalog
    // row pointing at it.
    const isDuplicate = rows.some(
      (row) =>
        row.region.trim().toLowerCase() === region.trim().toLowerCase() &&
        row.province.trim().toLowerCase() === province.trim().toLowerCase() &&
        row.lcNumber.trim().toLowerCase() === lcNumber.trim().toLowerCase(),
    );

    if (isDuplicate) {
      enqueueNotification({
        message:
          "An LC Map with this Region, Province, and LC Number already exists -- delete the existing one first if you want to replace it.",
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
        buildLayerName(lcNumber, province),
        setPublishStage,
      );

      const result = await layer.applyEdits({
        addFeatures: [
          {
            attributes: {
              region: region.trim(),
              province: province.trim(),
              lc_number: lcNumber.trim(),
              item_id: itemId,
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

  // Permanently deletes the real ArcGIS item first (looking up its current
  // owner fresh -- see getItemOwner -- then targeting that owner's account,
  // see deletePortalItem), then removes the catalog row. Done in that order
  // deliberately: if the ArcGIS delete fails (e.g. the signed-in super
  // admin isn't that item's owner and isn't an org admin either), the
  // catalog row is left in place rather than pointing at a promise that
  // never happened -- a stray still-published layer with no catalog row is
  // a far smaller problem than a catalog row pointing at nothing.
  const confirmDelete = async () => {
    if (!layer || !pendingDeleteRow) return;

    setDeleting(true);

    try {
      const owner = await getItemOwner(pendingDeleteRow.itemId);

      await deletePortalItem(owner, pendingDeleteRow.itemId);

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
                <a
                  css={rowMetaLinkStyle}
                  href={`${getPortalUrl()}/home/item.html?id=${row.itemId}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {row.itemId}
                </a>
              </div>
              {/* Deleting now permanently removes the real ArcGIS item --
                  see confirmDelete. */}
              <div css={rowActionsStyle}>
                <button
                  type="button"
                  css={[rowActionButtonStyle, deleteActionButtonStyle]}
                  onClick={() => requestDelete(row)}
                >
                  Delete
                </button>
              </div>
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
          </div>

          <div css={formFieldStyle}>
            <label css={formLabelStyle}>LC Number</label>
            <TextInput value={lcNumber} onChange={(e) => setLcNumber(e.target.value)} />
          </div>

          <div css={formFieldStyle}>
            <label css={formLabelStyle}>Layer Name</label>
            {/* Auto-generated from LC Number + Province (see buildLayerName)
                instead of free text -- guarantees a name that's both
                ArcGIS-safe and, since it's tied to the same combination the
                duplicate check above validates, never collides with
                another entry published from this form. */}
            <div css={currentValueStyle}>
              {lcNumber.trim() && province.trim()
                ? buildLayerName(lcNumber, province)
                : "Fill in LC Number and Province to preview"}
            </div>
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

      {/* Full-screen overlay so a multi-step publish (or a delete) is
          obviously in progress, instead of the only feedback being the
          small stage label buried in the form's Shapefile field. */}
      {saving && (
        <LoadingOverlay
          text={publishStage ? PUBLISH_STAGE_LABEL[publishStage] : "Publishing..."}
        />
      )}
      {deleting && <LoadingOverlay text="Deleting..." />}
    </div>
  );
}
