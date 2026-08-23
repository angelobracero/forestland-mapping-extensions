import { type AllWidgetProps } from "jimu-core";
import { useMemo, useState } from "react";
import { Paper, Select, Option, TextInput } from "jimu-ui";

import {
  containerStyle,
  headerStyle,
  titleStyle,
  dividerStyle,
  subtitleStyle,
  filterBarStyle,
  filterFieldStyle,
  searchFieldStyle,
  filterLabelStyle,
  filterFooterStyle,
  clearFiltersButtonStyle,
  groupListStyle,
  groupCardStyle,
  groupHeaderStyle,
  groupHeaderLeftStyle,
  groupTitleStyle,
  groupCountBadgeStyle,
  chevronStyle,
  chevronOpenStyle,
  commentListStyle,
  commentItemStyle,
  commentTextStyle,
  commentMetaStyle,
  commentMetaDotStyle,
  attachmentBadgeStyle,
  emptyStateStyle,
} from "./style";

// TODO: this is placeholder/mock data shaped after the real "Comment"
// feature layer fields (Editor, Office, Comment, Province, created_date,
// Photos And Files). Once wired up, query the feature layer the same way
// lcmap-filter does and map its features to this shape.
//
// NOTE: the feature layer fields the user provided don't include a Region
// or LC Number field. "region" below is only added here so the filter bar
// has something to cascade from, based on which region each province
// actually belongs to. If the real layer doesn't have a Region field, this
// will need to come from a lookup table (province -> region) or a join
// with the LC map catalog layer instead.
type FeedbackComment = {
  editor: string;
  office: string;
  comment: string;
  region: string;
  province: string;
  createdDate: string;
  attachmentCount: number;
};

const mockComments: FeedbackComment[] = [
  {
    editor: "J. Santos",
    office: "DENR-PENRO Nueva Vizcaya",
    comment:
      "The proposed boundary along the eastern ridge overlaps with an existing ancestral domain claim. Requesting a field validation before finalizing.",
    region: "Region II - Cagayan Valley",
    province: "Nueva Vizcaya",
    createdDate: "2025-06-02",
    attachmentCount: 2,
  },
  {
    editor: "M. Dela Cruz",
    office: "LGU Bayombong Planning Office",
    comment:
      "Classification looks consistent with the current land use plan. No objections from our end.",
    region: "Region II - Cagayan Valley",
    province: "Nueva Vizcaya",
    createdDate: "2025-06-10",
    attachmentCount: 0,
  },
  {
    editor: "K. Ramos",
    office: "DENR-CENRO Bayombong",
    comment:
      "A portion of the proposed forestland area is already covered by an approved CBFM agreement. Please review the attached documents.",
    region: "Region II - Cagayan Valley",
    province: "Nueva Vizcaya",
    createdDate: "2025-06-20",
    attachmentCount: 1,
  },
  {
    editor: "R. Aquino",
    office: "DENR-CENRO Ifugao",
    comment:
      "Please double-check the southern portion near the river; residents report this area has been cultivated for over a decade.",
    region: "CAR - Cordillera Administrative Region",
    province: "Ifugao",
    createdDate: "2025-05-18",
    attachmentCount: 3,
  },
  {
    editor: "L. Bautista",
    office: "LGU Lagawe Assessor's Office",
    comment: "Agreed with the proposed classification for this map sheet.",
    region: "CAR - Cordillera Administrative Region",
    province: "Ifugao",
    createdDate: "2025-05-22",
    attachmentCount: 0,
  },
  {
    editor: "N. Domingo",
    office: "DENR-CENRO Ifugao",
    comment:
      "Requesting an updated technical description; the coordinates in the draft map don't match the survey returns we have on file.",
    region: "CAR - Cordillera Administrative Region",
    province: "Ifugao",
    createdDate: "2025-06-15",
    attachmentCount: 2,
  },
  {
    editor: "P. Reyes",
    office: "DENR-PENRO Quirino",
    comment:
      "There is a discrepancy between the printed map and the GIS layer near barangay boundary markers 12-14.",
    region: "Region II - Cagayan Valley",
    province: "Quirino",
    createdDate: "2025-07-01",
    attachmentCount: 1,
  },
  {
    editor: "A. Fernandez",
    office: "LGU Diffun Planning Office",
    comment:
      "Requesting clarification on the classification of the area beside the proposed road right-of-way.",
    region: "Region II - Cagayan Valley",
    province: "Quirino",
    createdDate: "2025-07-05",
    attachmentCount: 0,
  },
  {
    editor: "T. Guzman",
    office: "DENR-CENRO Quirino",
    comment:
      "The map sheet accurately reflects the boundary agreed upon during the 2024 technical conference.",
    region: "Region II - Cagayan Valley",
    province: "Quirino",
    createdDate: "2025-07-12",
    attachmentCount: 0,
  },
  {
    editor: "C. Villanueva",
    office: "DENR-CENRO Isabela",
    comment:
      "Community consultation completed. No conflicting claims reported for this map sheet.",
    region: "Region II - Cagayan Valley",
    province: "Isabela",
    createdDate: "2025-04-14",
    attachmentCount: 1,
  },
  {
    editor: "E. Mercado",
    office: "LGU Ilagan Planning Office",
    comment:
      "Portion near the proposed irrigation canal should be re-checked against the DPWH right-of-way plan.",
    region: "Region II - Cagayan Valley",
    province: "Isabela",
    createdDate: "2025-04-28",
    attachmentCount: 2,
  },
  {
    editor: "G. Navarro",
    office: "DENR-PENRO Isabela",
    comment: "No further comments. Ready for endorsement.",
    region: "Region II - Cagayan Valley",
    province: "Isabela",
    createdDate: "2025-05-05",
    attachmentCount: 0,
  },
  {
    editor: "V. Castillo",
    office: "DENR-CENRO Cagayan",
    comment:
      "The riverbank area shown as forestland has shifted significantly since the last survey due to erosion. Requesting updated imagery.",
    region: "Region II - Cagayan Valley",
    province: "Cagayan",
    createdDate: "2025-03-19",
    attachmentCount: 3,
  },
  {
    editor: "H. Salvador",
    office: "LGU Tuguegarao Assessor's Office",
    comment:
      "Boundary matches our tax mapping records for this section. No objections.",
    region: "Region II - Cagayan Valley",
    province: "Cagayan",
    createdDate: "2025-03-25",
    attachmentCount: 0,
  },
  {
    editor: "F. Ocampo",
    office: "DENR-PENRO Cagayan",
    comment:
      "Please indicate the classification status of the small enclave near barangay Buyon; it appears blank in the current draft.",
    region: "Region II - Cagayan Valley",
    province: "Cagayan",
    createdDate: "2025-04-02",
    attachmentCount: 1,
  },
  {
    editor: "S. Marquez",
    office: "DENR-CENRO Benguet",
    comment:
      "The proposed line cuts through an area with existing mining claims. Requesting coordination with MGB before finalizing.",
    region: "CAR - Cordillera Administrative Region",
    province: "Benguet",
    createdDate: "2025-02-11",
    attachmentCount: 2,
  },
  {
    editor: "D. Pascual",
    office: "LGU La Trinidad Planning Office",
    comment:
      "Agreed with the classification. Requesting a copy of the final map once approved.",
    region: "CAR - Cordillera Administrative Region",
    province: "Benguet",
    createdDate: "2025-02-20",
    attachmentCount: 0,
  },
];

function groupByProvince(comments: FeedbackComment[]) {
  const groups = new Map<string, FeedbackComment[]>();

  comments.forEach((comment) => {
    const existing = groups.get(comment.province) ?? [];

    existing.push(comment);
    groups.set(comment.province, existing);
  });

  return [...groups.entries()]
    .map(([province, items]) => ({ province, items }))
    .sort((a, b) => a.province.localeCompare(b.province));
}

function Widget(props: AllWidgetProps<any>) {
  const [searchText, setSearchText] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [expandedProvince, setExpandedProvince] = useState<string | null>(
    null,
  );

  const regions = useMemo(
    () => [...new Set(mockComments.map((c) => c.region))].sort(),
    [],
  );

  const provinces = useMemo(() => {
    const source = selectedRegion
      ? mockComments.filter((c) => c.region === selectedRegion)
      : mockComments;

    return [...new Set(source.map((c) => c.province))].sort();
  }, [selectedRegion]);

  const filtersActive = Boolean(
    searchText.trim() || selectedRegion || selectedProvince,
  );

  const filteredComments = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return mockComments.filter((c) => {
      if (selectedRegion && c.region !== selectedRegion) return false;
      if (selectedProvince && c.province !== selectedProvince) return false;

      if (query) {
        const haystack =
          `${c.comment} ${c.editor} ${c.office}`.toLowerCase();

        if (!haystack.includes(query)) return false;
      }

      return true;
    });
  }, [searchText, selectedRegion, selectedProvince]);

  const groups = useMemo(
    () => groupByProvince(filteredComments),
    [filteredComments],
  );

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setSelectedProvince("");
  };

  const clearFilters = () => {
    setSearchText("");
    setSelectedRegion("");
    setSelectedProvince("");
  };

  const toggleGroup = (province: string) => {
    setExpandedProvince((current) =>
      current === province ? null : province,
    );
  };

  return (
    <Paper className="jimu-widget" component="main">
      <div css={containerStyle}>
        <div css={headerStyle}>
          <h2 css={titleStyle}>View Feedbacks</h2>
          <div css={dividerStyle} />
          <p css={subtitleStyle}>
            Summary of comments submitted on the Proposed LC Maps, grouped by
            province.
          </p>
        </div>

        <div>
          <div css={filterBarStyle}>
            <div css={searchFieldStyle}>
              <label css={filterLabelStyle}>Search</label>
              <TextInput
                type="search"
                allowClear
                placeholder="Search comments, editor, or office..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            <div css={filterFieldStyle}>
              <label css={filterLabelStyle}>Region</label>
              <Select
                value={selectedRegion}
                onChange={(e) => handleRegionChange(e.target.value)}
                placeholder="All Regions"
              >
                {regions.map((region) => (
                  <Option key={region} value={region}>
                    {region}
                  </Option>
                ))}
              </Select>
            </div>

            <div css={filterFieldStyle}>
              <label css={filterLabelStyle}>Province</label>
              <Select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                placeholder="All Provinces"
              >
                {provinces.map((province) => (
                  <Option key={province} value={province}>
                    {province}
                  </Option>
                ))}
              </Select>
            </div>
          </div>

          {filtersActive && (
            <div css={filterFooterStyle} style={{ marginTop: "12px" }}>
              <span>
                Showing {filteredComments.length} of {mockComments.length}{" "}
                comments
              </span>
              <button css={clearFiltersButtonStyle} onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          )}
        </div>

        {groups.length === 0 ? (
          <div css={emptyStateStyle}>
            {filtersActive
              ? "No feedback matches your filters."
              : "No feedback submitted yet."}
          </div>
        ) : (
          <div css={groupListStyle}>
            {groups.map((group) => {
              const isOpen = filtersActive || expandedProvince === group.province;

              return (
                <div key={group.province} css={groupCardStyle}>
                  <div
                    css={groupHeaderStyle}
                    onClick={() => toggleGroup(group.province)}
                  >
                    <div css={groupHeaderLeftStyle}>
                      <h3 css={groupTitleStyle}>{group.province}</h3>
                      <span css={groupCountBadgeStyle}>
                        {group.items.length}{" "}
                        {group.items.length === 1 ? "comment" : "comments"}
                      </span>
                    </div>
                    <span
                      css={[chevronStyle, isOpen && chevronOpenStyle]}
                    >
                      &#9660;
                    </span>
                  </div>

                  {isOpen && (
                    <div css={commentListStyle}>
                      {group.items.map((item, index) => (
                        <div key={index} css={commentItemStyle}>
                          <p css={commentTextStyle}>{item.comment}</p>
                          <div css={commentMetaStyle}>
                            <span>{item.editor}</span>
                            <span css={commentMetaDotStyle}>&middot;</span>
                            <span>{item.office}</span>
                            <span css={commentMetaDotStyle}>&middot;</span>
                            <span>{item.createdDate}</span>
                            {item.attachmentCount > 0 && (
                              <span css={attachmentBadgeStyle}>
                                &#128206; {item.attachmentCount}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Paper>
  );
}

export default Widget;
