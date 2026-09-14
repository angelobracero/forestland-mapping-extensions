import { ADMINS_TABLE_ITEM_ID, ADMINS_TABLE_LAYER_ID } from "widgets/shared-code/admin-auth";
import { OFFICE_OPTIONS_TABLE_ITEM_ID } from "widgets/shared-code/content-config";
import type { UploadKind } from "./media-upload";

type FieldType = "text" | "textarea" | "date" | "number" | "select";

export type FieldDef = {
  key: string;
  label: string;
  fieldCandidates: string[];
  type: FieldType;
  options?: Array<{ value: string; label: string }>;
  // Shows an upload button beside the URL field, which uploads the picked
  // file to R2 and fills the field with the resulting URL. "image"/"video"
  // restrict the file picker to that kind; "media" allows either (used by
  // LCD, whose media_url can be either a photo or a video).
  uploadKind?: UploadKind;
  // When this upload field's file finishes uploading, also set the field
  // with this key to whatever kind ("image"/"video") the upload turned
  // out to be -- so e.g. LCD's Type is detected from the actual file
  // instead of asking the admin to pick it themselves.
  syncTypeToKey?: string;
  // Still saved/loaded as usual, just not shown in the Add/Edit form --
  // used for fields a syncTypeToKey field already fills in.
  hidden?: boolean;
};

export type TableDef = {
  id: string;
  label: string;
  // Defaults to CONTENT_ITEM_ID (GAD/LCD/About all live in that one item)
  // -- only the Admins table below lives in a different item.
  itemId?: string;
  layerId: number;
  fields: FieldDef[];
  // When set, AdminTableSection sorts rows by this field and shows a drag
  // handle for reordering them (persisted back into the same field) --
  // GAD/LCD/About opt into this below; Office Options/Admins don't, so
  // they keep the plain default/service order.
  sortFieldCandidates?: string[];
};

export const TABLES: TableDef[] = [
  {
    id: "gad",
    label: "GAD Activities",
    layerId: 0,
    sortFieldCandidates: ["sort_order"],
    fields: [
      { key: "title", label: "Title", fieldCandidates: ["title"], type: "text" },
      { key: "activity_date", label: "Date", fieldCandidates: ["activity_date", "date"], type: "date" },
      {
        key: "image_url",
        label: "Image URL",
        fieldCandidates: ["image_url", "image"],
        type: "text",
        uploadKind: "image",
      },
    ],
  },
  {
    id: "lcd",
    label: "LCD in Action Media",
    layerId: 1,
    sortFieldCandidates: ["sort_order"],
    fields: [
      { key: "title", label: "Title", fieldCandidates: ["title"], type: "text" },
      {
        key: "media_type",
        label: "Type",
        fieldCandidates: ["media_type"],
        type: "select",
        options: [
          { value: "image", label: "Photo" },
          { value: "video", label: "Video" },
        ],
        hidden: true,
      },
      { key: "media_date", label: "Date", fieldCandidates: ["media_date", "date"], type: "date" },
      {
        key: "media_url",
        label: "Media URL",
        fieldCandidates: ["media_url", "media"],
        type: "text",
        uploadKind: "media",
        syncTypeToKey: "media_type",
      },
    ],
  },
  {
    id: "about",
    label: "About AVPs",
    layerId: 2,
    sortFieldCandidates: ["sort_order"],
    fields: [
      { key: "title", label: "Title", fieldCandidates: ["title"], type: "text" },
      { key: "description", label: "Description", fieldCandidates: ["description"], type: "textarea" },
      {
        key: "video_url",
        label: "Video URL",
        fieldCandidates: ["video_url", "video"],
        type: "text",
        uploadKind: "video",
      },
    ],
  },
  {
    id: "office-options",
    label: "Office Options",
    // Its own item, not CONTENT_ITEM_ID -- see OFFICE_OPTIONS_TABLE_ITEM_ID.
    itemId: OFFICE_OPTIONS_TABLE_ITEM_ID,
    layerId: 0,
    fields: [
      { key: "label", label: "Office", fieldCandidates: ["label"], type: "text" },
    ],
  },
];

// Lets admins add/remove the accounts that show up in checkIsContentAdmin's
// table lookup (see widgets/shared-code/admin-auth.ts).
export const ADMINS_TABLE: TableDef = {
  id: "admins",
  label: "Admins",
  itemId: ADMINS_TABLE_ITEM_ID,
  layerId: ADMINS_TABLE_LAYER_ID,
  fields: [
    { key: "username", label: "Username", fieldCandidates: ["username"], type: "text" },
    {
      key: "display_name",
      label: "Display Name",
      fieldCandidates: ["display_name"],
      type: "text",
    },
  ],
};

export function toDateInputValue(rawValue: unknown): string {
  if (rawValue === null || rawValue === undefined || rawValue === "") {
    return "";
  }

  const timestamp =
    typeof rawValue === "number" ? rawValue : new Date(rawValue as string).getTime();

  if (Number.isNaN(timestamp)) {
    return "";
  }

  return new Date(timestamp).toISOString().slice(0, 10);
}

export function displayValue(fieldDef: FieldDef, rawValue: unknown): string {
  if (rawValue === null || rawValue === undefined || rawValue === "") {
    return "";
  }

  if (fieldDef.type === "date") {
    const timestamp =
      typeof rawValue === "number" ? rawValue : new Date(rawValue as string).getTime();

    if (Number.isNaN(timestamp)) {
      return "";
    }

    return new Date(timestamp).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  if (fieldDef.type === "select") {
    return (
      fieldDef.options?.find((option) => option.value === rawValue)?.label ??
      String(rawValue)
    );
  }

  return String(rawValue);
}

export type Row = {
  objectId: number;
  values: Record<string, any>; // keyed by FieldDef.key, raw attribute values
};
