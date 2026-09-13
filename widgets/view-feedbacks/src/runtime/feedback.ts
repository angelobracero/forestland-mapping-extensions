import type AttachmentInfo from "@arcgis/core/rest/query/support/AttachmentInfo";

export type FeedbackComment = {
  objectId: number;
  editor: string;
  office: string;
  // Free-text office name from the comment form's "Others" option -- only
  // meaningful when office === "Others" (see lcmap-filter's OFFICE_FIELD/
  // OFFICE_OTHER_FIELD). Not in the Office filter chips; findable by search.
  officeOther: string;
  comment: string;
  region: string;
  province: string;
  lcNumber: string;
  createdDate: number | null;
  attachments: AttachmentInfo[];
  resolved: boolean;
};

export type SortOrder = "newest" | "oldest";
export type DateRangePreset = "all" | "7d" | "30d" | "90d";

export const DATE_RANGE_MS: Record<Exclude<DateRangePreset, "all">, number> = {
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
  "90d": 90 * 24 * 60 * 60 * 1000,
};

// Normalizes a date field's raw value into an epoch-ms timestamp. The
// value from the layer could already be a number, or a date string
// (e.g. ISO format) -- subtracting two raw strings produces NaN, which
// makes Array.prototype.sort() treat every pair as "equal" and silently
// leave the order unchanged.
export function toTimestamp(rawValue: unknown): number | null {
  if (rawValue === null || rawValue === undefined || rawValue === "") {
    return null;
  }

  const timestamp =
    typeof rawValue === "number" ? rawValue : new Date(rawValue as string).getTime();

  return Number.isNaN(timestamp) ? null : timestamp;
}

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "?";

  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function formatDate(value: number | null) {
  if (!value) return "";

  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}
