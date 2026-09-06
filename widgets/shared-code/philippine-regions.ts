// Official regions of the Philippines, in the short-code format already
// used in this org's existing data (e.g. "Region V", "CAR", "NIR",
// "Region IV-A") -- confirmed against the PSA's Philippine Standard
// Geographic Code (PSGC), which NAMRIA co-maintains:
// https://psa.gov.ph/classification/psgc/regions
//
// Used by content-admin (the fixed Region choices when publishing a new LC
// Map) and lcmap-filter (the public Region filter, which prefers this
// canonical order over whatever order the catalog table's rows happen to
// come back in).
export const PHILIPPINE_REGIONS = [
  "NCR",
  "CAR",
  "Region I",
  "Region II",
  "Region III",
  "Region IV-A",
  "MIMAROPA",
  "Region V",
  "Region VI",
  "NIR",
  "Region VII",
  "Region VIII",
  "Region IX",
  "Region X",
  "Region XI",
  "Region XII",
  "Region XIII",
  "BARMM",
];
