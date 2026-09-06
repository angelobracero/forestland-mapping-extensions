// Provinces per region, keyed by the exact region labels in
// ./philippine-regions.ts. Confirmed against Wikipedia's "Provinces of the
// Philippines" (2024 reorganization, including Negros Island Region) and
// cross-checked Region IX specifically against DILG/PhilAtlas -- Wikipedia's
// summary initially misattributed Sulu to Region IX; it belongs to BARMM
// only, which the province list below reflects.
export const PROVINCES_BY_REGION: Record<string, string[]> = {
  // NCR has no provinces -- it's subdivided directly into 16 cities plus
  // Pateros (the region's one remaining municipality), so those stand in
  // for "province" here.
  NCR: [
    "Caloocan",
    "Las Piñas",
    "Makati",
    "Malabon",
    "Mandaluyong",
    "Manila",
    "Marikina",
    "Muntinlupa",
    "Navotas",
    "Parañaque",
    "Pasay",
    "Pasig",
    "Quezon City",
    "San Juan",
    "Taguig",
    "Valenzuela",
    "Pateros",
  ],
  CAR: ["Abra", "Apayao", "Benguet", "Ifugao", "Kalinga", "Mountain Province"],
  "Region I": ["Ilocos Norte", "Ilocos Sur", "La Union", "Pangasinan"],
  "Region II": ["Batanes", "Cagayan", "Nueva Vizcaya", "Quirino"],
  "Region III": [
    "Aurora",
    "Bataan",
    "Bulacan",
    "Nueva Ecija",
    "Pampanga",
    "Tarlac",
    "Zambales",
  ],
  "Region IV-A": ["Batangas", "Cavite", "Laguna", "Quezon", "Rizal"],
  MIMAROPA: [
    "Marinduque",
    "Occidental Mindoro",
    "Oriental Mindoro",
    "Palawan",
    "Romblon",
  ],
  "Region V": [
    "Albay",
    "Camarines Norte",
    "Camarines Sur",
    "Catanduanes",
    "Masbate",
    "Sorsogon",
  ],
  "Region VI": ["Aklan", "Antique", "Capiz", "Guimaras", "Iloilo"],
  NIR: ["Negros Occidental", "Negros Oriental", "Siquijor"],
  "Region VII": ["Bohol", "Cebu"],
  "Region VIII": [
    "Biliran",
    "Eastern Samar",
    "Leyte",
    "Northern Samar",
    "Samar",
    "Southern Leyte",
  ],
  "Region IX": ["Zamboanga del Norte", "Zamboanga del Sur", "Zamboanga Sibugay"],
  "Region X": [
    "Bukidnon",
    "Camiguin",
    "Lanao del Norte",
    "Misamis Occidental",
    "Misamis Oriental",
  ],
  "Region XI": [
    "Davao de Oro",
    "Davao del Norte",
    "Davao del Sur",
    "Davao Occidental",
    "Davao Oriental",
  ],
  "Region XII": ["Cotabato", "Sarangani", "South Cotabato", "Sultan Kudarat"],
  "Region XIII": [
    "Agusan del Norte",
    "Agusan del Sur",
    "Dinagat Islands",
    "Surigao del Norte",
    "Surigao del Sur",
  ],
  BARMM: [
    "Basilan",
    "Lanao del Sur",
    "Maguindanao del Norte",
    "Maguindanao del Sur",
    "Sulu",
    "Tawi-Tawi",
  ],
};
