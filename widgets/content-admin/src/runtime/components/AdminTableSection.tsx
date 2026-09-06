import { useEffect, useState } from "react";
import {
  TextInput,
  TextArea,
  NumericInput,
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
import { resolveFieldName } from "widgets/shared-code/field-utils";
import { CONTENT_ITEM_ID } from "widgets/shared-code/content-config";

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
  modalDialogStyle,
  MODAL_BELOW_HEADER_CLASS,
  modalBelowHeaderCss,
} from "../style";
import { type FieldDef, type TableDef, type Row, toDateInputValue, displayValue } from "../tables";
import {
  UPLOAD_ACCEPT_BY_KIND,
  UPLOAD_LABEL_BY_KIND,
  uploadMediaFile,
  deleteMediaFileByUrl,
} from "../media-upload";

export function AdminTableSection({ tableDef }: { tableDef: TableDef }) {
  const [layer, setLayer] = useState<FeatureLayer | null>(null);
  const [fieldNamesByKey, setFieldNamesByKey] = useState<Record<string, string>>({});
  // Some portals use the newer "date-only" field type (a plain YYYY-MM-DD
  // string, no time/timezone) instead of the older "date" type (an epoch-ms
  // timestamp) -- track which of our date fields are date-only so writes
  // send the format the field actually expects.
  const [dateOnlyByKey, setDateOnlyByKey] = useState<Record<string, boolean>>({});
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingRow, setEditingRow] = useState<Row | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  const [pendingDeleteRow, setPendingDeleteRow] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [uploadingFieldKey, setUploadingFieldKey] = useState<string | null>(null);

  const loadRows = async (
    activeLayer: FeatureLayer,
    fieldMap: Record<string, string>,
  ) => {
    setLoading(true);
    setError(null);

    try {
      const query = activeLayer.createQuery();

      query.where = "1=1";
      query.outFields = ["*"];
      query.returnGeometry = false;

      const result = await activeLayer.queryFeatures(query);

      const items: Row[] = result.features.map((feature) => {
        const attributes = feature.attributes;
        const values: Record<string, any> = {};

        tableDef.fields.forEach((fieldDef) => {
          const fieldName = fieldMap[fieldDef.key];

          values[fieldDef.key] = fieldName ? attributes[fieldName] : undefined;
        });

        return {
          objectId: attributes[activeLayer.objectIdField],
          values,
        };
      });

      setRows(items);
    } catch (loadError) {
      console.error(`Failed to load ${tableDef.label}:`, loadError);

      setError(`Failed to load ${tableDef.label}.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      setLoading(true);
      setError(null);

      try {
        const newLayer = new FeatureLayer({
          portalItem: { id: tableDef.itemId ?? CONTENT_ITEM_ID },
          layerId: tableDef.layerId,
        });

        await newLayer.load();

        if (cancelled) return;

        const fieldMap: Record<string, string> = {};
        const dateOnlyMap: Record<string, boolean> = {};

        tableDef.fields.forEach((fieldDef) => {
          const resolved = resolveFieldName(newLayer, ...fieldDef.fieldCandidates);

          if (resolved) {
            fieldMap[fieldDef.key] = resolved;

            if (fieldDef.type === "date") {
              const field = newLayer.fields?.find((f) => f.name === resolved);

              dateOnlyMap[fieldDef.key] = field?.type === "date-only";
            }
          } else {
            console.warn(
              `${tableDef.label}: no recognizable "${fieldDef.label}" field; that column will be blank.`,
            );
          }
        });

        setLayer(newLayer);
        setFieldNamesByKey(fieldMap);
        setDateOnlyByKey(dateOnlyMap);

        await loadRows(newLayer, fieldMap);
      } catch (loadError) {
        if (cancelled) return;

        console.error(`Failed to load ${tableDef.label}:`, loadError);

        setError(`Failed to load ${tableDef.label}.`);
        setLoading(false);
      }
    };

    init();

    return () => {
      cancelled = true;
    };
    // Only re-run if the table itself changes (a new AdminTableSection
    // instance handles that via `key`, but this keeps the effect honest
    // about its real dependency without re-running on every render).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableDef.id]);

  const openAddForm = () => {
    const blankValues: Record<string, any> = {};

    tableDef.fields.forEach((fieldDef) => {
      blankValues[fieldDef.key] =
        fieldDef.type === "select" ? fieldDef.options?.[0]?.value ?? "" : "";
    });

    setEditingRow(null);
    setFormValues(blankValues);
    setIsFormOpen(true);
  };

  const openEditForm = (row: Row) => {
    setEditingRow(row);
    setFormValues({ ...row.values });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;

    setIsFormOpen(false);
    setEditingRow(null);
  };

  const updateFormValue = (key: string, value: any) => {
    setFormValues((current) => ({ ...current, [key]: value }));
  };

  const handleUploadFile = async (fieldDef: FieldDef, file: File) => {
    const key = fieldDef.key;
    const previousUrl = formValues[key];

    setUploadingFieldKey(key);

    try {
      const { url, type } = await uploadMediaFile(file);

      updateFormValue(key, url);

      if (fieldDef.syncTypeToKey) {
        updateFormValue(fieldDef.syncTypeToKey, type);
      }

      // Editing an existing entry and replacing its file -- the old file
      // is no longer referenced anywhere once this save goes through, so
      // clean it up too. Best effort: this shouldn't block the upload.
      if (editingRow && previousUrl) {
        try {
          await deleteMediaFileByUrl(previousUrl);
        } catch (cleanupError) {
          console.error("Failed to remove old R2 file:", cleanupError);
        }
      }

      enqueueNotification({
        message: "File uploaded.",
        severity: "success",
        placement: "bottom-left",
      });
    } catch (uploadError) {
      console.error("Failed to upload file:", uploadError);

      enqueueNotification({
        message:
          uploadError instanceof Error
            ? uploadError.message
            : "Failed to upload file.",
        severity: "error",
        placement: "bottom-left",
      });
    } finally {
      setUploadingFieldKey(null);
    }
  };

  const handleSaveForm = async () => {
    if (!layer) return;

    setSaving(true);

    try {
      const attributes: Record<string, any> = {};

      tableDef.fields.forEach((fieldDef) => {
        const fieldName = fieldNamesByKey[fieldDef.key];

        if (!fieldName) return;

        const rawValue = formValues[fieldDef.key];

        if (fieldDef.type === "date") {
          if (dateOnlyByKey[fieldDef.key]) {
            // date-only fields want the plain YYYY-MM-DD string as-is --
            // that's exactly what the native date input already gives us.
            attributes[fieldName] = rawValue || null;
          } else {
            attributes[fieldName] = rawValue ? new Date(rawValue).getTime() : null;
          }
        } else if (fieldDef.type === "number") {
          attributes[fieldName] =
            rawValue === "" || rawValue === undefined ? null : Number(rawValue);
        } else {
          attributes[fieldName] = rawValue || null;
        }
      });

      if (editingRow) {
        attributes[layer.objectIdField] = editingRow.objectId;

        const result = await layer.applyEdits({ updateFeatures: [{ attributes }] });
        const failed = result.updateFeatureResults?.find((r) => r.error);

        if (failed?.error) {
          throw failed.error;
        }

        enqueueNotification({
          message: `${tableDef.label} entry updated.`,
          severity: "success",
          placement: "bottom-left",
        });
      } else {
        const result = await layer.applyEdits({ addFeatures: [{ attributes }] });
        const failed = result.addFeatureResults?.find((r) => r.error);

        if (failed?.error) {
          throw failed.error;
        }

        enqueueNotification({
          message: `${tableDef.label} entry added.`,
          severity: "success",
          placement: "bottom-left",
        });
      }

      setIsFormOpen(false);
      setEditingRow(null);

      await loadRows(layer, fieldNamesByKey);
    } catch (saveError) {
      console.error(`Failed to save ${tableDef.label} entry:`, saveError);

      enqueueNotification({
        message: `Failed to save ${tableDef.label} entry.`,
        severity: "error",
        placement: "bottom-left",
      });
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = (row: Row) => {
    setPendingDeleteRow(row);
  };

  const cancelDelete = () => {
    if (deleting) return;

    setPendingDeleteRow(null);
  };

  const confirmDelete = async () => {
    if (!layer || !pendingDeleteRow) return;

    setDeleting(true);

    try {
      const result = await layer.applyEdits({
        deleteFeatures: [{ objectId: pendingDeleteRow.objectId }],
      });

      const failed = result.deleteFeatureResults?.find(
        (r) => r.objectId === pendingDeleteRow.objectId && r.error,
      );

      if (failed?.error) {
        throw failed.error;
      }

      // Row is gone -- also clean up any files it referenced. Best
      // effort: the row delete already succeeded, so a cleanup failure
      // here shouldn't be reported as the delete having failed.
      for (const uploadFieldDef of tableDef.fields) {
        if (!uploadFieldDef.uploadKind) continue;

        const url = pendingDeleteRow.values[uploadFieldDef.key];

        if (!url) continue;

        try {
          await deleteMediaFileByUrl(url);
        } catch (cleanupError) {
          console.error("Failed to remove R2 file:", cleanupError);
        }
      }

      enqueueNotification({
        message: `${tableDef.label} entry deleted.`,
        severity: "success",
        placement: "bottom-left",
      });

      setPendingDeleteRow(null);

      await loadRows(layer, fieldNamesByKey);
    } catch (deleteError) {
      console.error(`Failed to delete ${tableDef.label} entry:`, deleteError);

      enqueueNotification({
        message: `Failed to delete ${tableDef.label} entry.`,
        severity: "error",
        placement: "bottom-left",
      });
    } finally {
      setDeleting(false);
    }
  };

  const titleFieldKey = tableDef.fields[0]?.key;
  const metaFieldKeys = tableDef.fields
    .map((f) => f.key)
    .filter((key) => key !== titleFieldKey && key !== "description");

  return (
    <div css={sectionStyle}>
      <div css={sectionHeaderStyle}>
        <h3 css={sectionTitleStyle}>{tableDef.label}</h3>
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
          No entries yet. Click "+ Add New" to create one.
        </div>
      ) : (
        <div css={rowListStyle}>
          {rows.map((row) => {
            const titleFieldDef = tableDef.fields.find(
              (f) => f.key === titleFieldKey,
            );
            const titleText = titleFieldDef
              ? displayValue(titleFieldDef, row.values[titleFieldKey])
              : "";

            const metaText = metaFieldKeys
              .map((key) => {
                const fieldDef = tableDef.fields.find((f) => f.key === key);

                return fieldDef ? displayValue(fieldDef, row.values[key]) : "";
              })
              .filter(Boolean)
              .join(" · ");

            return (
              <div key={row.objectId} css={rowItemStyle}>
                <div css={rowInfoStyle}>
                  <span css={rowTitleStyle}>{titleText || "(untitled)"}</span>
                  {metaText && <span css={rowMetaStyle}>{metaText}</span>}
                </div>
                <div css={rowActionsStyle}>
                  <button
                    type="button"
                    css={[rowActionButtonStyle, editActionButtonStyle]}
                    onClick={() => openEditForm(row)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    css={[rowActionButtonStyle, deleteActionButtonStyle]}
                    onClick={() => requestDelete(row)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT FORM */}
      <style>{modalBelowHeaderCss}</style>

      <Modal
        isOpen={isFormOpen}
        toggle={closeForm}
        centered
        css={modalDialogStyle}
        modalClassName={MODAL_BELOW_HEADER_CLASS}
      >
        <ModalHeader toggle={closeForm}>
          {editingRow ? `Edit ${tableDef.label} entry` : `Add ${tableDef.label} entry`}
        </ModalHeader>
        <ModalBody>
          {tableDef.fields
            .filter((fieldDef) => !fieldDef.hidden)
            .map((fieldDef) => (
            <div key={fieldDef.key} css={formFieldStyle}>
              <label css={formLabelStyle}>{fieldDef.label}</label>

              {fieldDef.type === "text" && (
                <div css={uploadRowStyle}>
                  <div style={{ flex: 1 }}>
                    {fieldDef.uploadKind ? (
                      <div css={currentValueStyle}>
                        {formValues[fieldDef.key] || "No file uploaded yet."}
                      </div>
                    ) : (
                      <TextInput
                        value={formValues[fieldDef.key] ?? ""}
                        onChange={(e) =>
                          updateFormValue(fieldDef.key, e.target.value)
                        }
                      />
                    )}
                  </div>

                  {fieldDef.uploadKind && (
                    <label css={uploadButtonStyle}>
                      {uploadingFieldKey === fieldDef.key
                        ? "Uploading..."
                        : UPLOAD_LABEL_BY_KIND[fieldDef.uploadKind]}
                      <input
                        type="file"
                        accept={UPLOAD_ACCEPT_BY_KIND[fieldDef.uploadKind]}
                        style={{ display: "none" }}
                        disabled={uploadingFieldKey === fieldDef.key}
                        onChange={(e) => {
                          const file = e.target.files?.[0];

                          e.target.value = "";

                          if (file) handleUploadFile(fieldDef, file);
                        }}
                      />
                    </label>
                  )}
                </div>
              )}

              {fieldDef.type === "textarea" && (
                <TextArea
                  height={100}
                  value={formValues[fieldDef.key] ?? ""}
                  onChange={(e) => updateFormValue(fieldDef.key, e.target.value)}
                />
              )}

              {fieldDef.type === "number" && (
                <NumericInput
                  value={formValues[fieldDef.key] ?? ""}
                  onChange={(value) => updateFormValue(fieldDef.key, value ?? "")}
                />
              )}

              {fieldDef.type === "date" && (
                <input
                  css={nativeInputStyle}
                  type="date"
                  value={toDateInputValue(formValues[fieldDef.key])}
                  onChange={(e) => updateFormValue(fieldDef.key, e.target.value)}
                />
              )}

              {fieldDef.type === "select" && (
                <Select
                  value={formValues[fieldDef.key] ?? ""}
                  onChange={(e) => updateFormValue(fieldDef.key, e.target.value)}
                >
                  {fieldDef.options?.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              )}
            </div>
          ))}
        </ModalBody>
        <ModalFooter>
          <Button type="default" onClick={closeForm} disabled={saving}>
            Cancel
          </Button>
          <Button type="primary" onClick={handleSaveForm} disabled={saving}>
            {saving ? "Saving..." : "Save"}
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
        <ModalHeader toggle={cancelDelete}>Delete entry</ModalHeader>
        <ModalBody>
          <p css={confirmDialogBodyStyle}>
            Delete this {tableDef.label} entry? This cannot be undone.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button type="default" onClick={cancelDelete} disabled={deleting}>
            Cancel
          </Button>
          <Button type="danger" onClick={confirmDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
