import type FeatureLayer from "@arcgis/core/layers/FeatureLayer";

// Field names/casing on these hosted layers aren't fully confirmed, so
// look them up case- and punctuation-insensitively instead of guessing
// exact casing. Shared by every widget that reads one of these layers.
function normalize(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function getFieldValue(
  attributes: Record<string, any>,
  ...candidates: string[]
): any {
  const normalizedCandidates = candidates.map(normalize);

  const key = Object.keys(attributes).find((attributeName) =>
    normalizedCandidates.includes(normalize(attributeName)),
  );

  return key ? attributes[key] : undefined;
}

export function resolveFieldName(
  layer: FeatureLayer,
  ...candidates: string[]
): string | undefined {
  const normalizedCandidates = candidates.map(normalize);

  return layer.fields?.find((field) =>
    normalizedCandidates.includes(normalize(field.name)),
  )?.name;
}

// rawValue comes back from a table as either a number (epoch-ms) or a
// date string; renders as e.g. "August 24, 2026".
export function formatDateLong(rawValue: unknown): string {
  if (rawValue === null || rawValue === undefined || rawValue === "") {
    return "";
  }

  const timestamp =
    typeof rawValue === "number" ? rawValue : new Date(rawValue as string).getTime();

  if (Number.isNaN(timestamp)) {
    return "";
  }

  try {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}
