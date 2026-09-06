import { Select, Option, TextInput } from "jimu-ui";
import type { SortOrder, DateRangePreset } from "../feedback";
import {
  filterBarStyle,
  filterFieldStyle,
  searchFieldStyle,
  filterLabelStyle,
  filtersToggleStyle,
  filtersToggleCountStyle,
  chipFiltersStyle,
  chipGroupStyle,
  chipStyle,
  chipActiveStyle,
  filterFooterStyle,
  clearFiltersButtonStyle,
} from "../style";

type FeedbackFiltersProps = {
  searchText: string;
  onSearchTextChange: (value: string) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (value: SortOrder) => void;
  dateRangePreset: DateRangePreset;
  onDateRangePresetChange: (value: DateRangePreset) => void;
  filtersExpanded: boolean;
  onToggleFiltersExpanded: () => void;
  activeChipFilterCount: number;
  regions: string[];
  provinces: string[];
  lcNumbers: string[];
  offices: string[];
  selectedRegions: string[];
  selectedProvinces: string[];
  selectedLcNumbers: string[];
  selectedOffices: string[];
  onToggleRegion: (region: string) => void;
  onToggleProvince: (province: string) => void;
  onToggleLcNumber: (lcNumber: string) => void;
  onToggleOffice: (office: string) => void;
  filtersActive: boolean;
  filteredCount: number;
  totalCount: number;
  onClearFilters: () => void;
};

export function FeedbackFilters({
  searchText,
  onSearchTextChange,
  sortOrder,
  onSortOrderChange,
  dateRangePreset,
  onDateRangePresetChange,
  filtersExpanded,
  onToggleFiltersExpanded,
  activeChipFilterCount,
  regions,
  provinces,
  lcNumbers,
  offices,
  selectedRegions,
  selectedProvinces,
  selectedLcNumbers,
  selectedOffices,
  onToggleRegion,
  onToggleProvince,
  onToggleLcNumber,
  onToggleOffice,
  filtersActive,
  filteredCount,
  totalCount,
  onClearFilters,
}: FeedbackFiltersProps) {
  return (
    <div>
      <div css={filterBarStyle}>
        <div css={searchFieldStyle}>
          <label css={filterLabelStyle}>Search</label>
          <TextInput
            type="search"
            allowClear
            placeholder="Search comments, editor, or office..."
            value={searchText}
            onChange={(e) => onSearchTextChange(e.target.value)}
          />
        </div>

        <div css={filterFieldStyle}>
          <label css={filterLabelStyle}>Sort by date</label>
          <Select
            value={sortOrder}
            onChange={(e) => onSortOrderChange(e.target.value as SortOrder)}
          >
            <Option value="newest">Newest first</Option>
            <Option value="oldest">Oldest first</Option>
          </Select>
        </div>

        <div css={filterFieldStyle}>
          <label css={filterLabelStyle}>Date range</label>
          <Select
            value={dateRangePreset}
            onChange={(e) =>
              onDateRangePresetChange(e.target.value as DateRangePreset)
            }
          >
            <Option value="all">All time</Option>
            <Option value="7d">Last 7 days</Option>
            <Option value="30d">Last 30 days</Option>
            <Option value="90d">Last 90 days</Option>
          </Select>
        </div>

        <button
          type="button"
          css={filtersToggleStyle}
          onClick={onToggleFiltersExpanded}
        >
          {filtersExpanded ? "Hide filters" : "More filters"}
          {activeChipFilterCount > 0 && (
            <span css={filtersToggleCountStyle}>{activeChipFilterCount}</span>
          )}
        </button>
      </div>

      {filtersExpanded && (
        <div css={chipFiltersStyle}>
          <div css={filterFieldStyle}>
            <label css={filterLabelStyle}>Region</label>
            <div css={chipGroupStyle}>
              {regions.map((region) => {
                const isSelected = selectedRegions.includes(region);

                return (
                  <button
                    key={region}
                    type="button"
                    css={[chipStyle, isSelected && chipActiveStyle]}
                    onClick={() => onToggleRegion(region)}
                  >
                    {region}
                  </button>
                );
              })}
            </div>
          </div>

          <div css={filterFieldStyle}>
            <label css={filterLabelStyle}>Province</label>
            <div css={chipGroupStyle}>
              {provinces.map((province) => {
                const isSelected = selectedProvinces.includes(province);

                return (
                  <button
                    key={province}
                    type="button"
                    css={[chipStyle, isSelected && chipActiveStyle]}
                    onClick={() => onToggleProvince(province)}
                  >
                    {province}
                  </button>
                );
              })}
            </div>
          </div>

          <div css={filterFieldStyle}>
            <label css={filterLabelStyle}>LC Map Number</label>
            <div css={chipGroupStyle}>
              {lcNumbers.map((lcNumber) => {
                const isSelected = selectedLcNumbers.includes(lcNumber);

                return (
                  <button
                    key={lcNumber}
                    type="button"
                    css={[chipStyle, isSelected && chipActiveStyle]}
                    onClick={() => onToggleLcNumber(lcNumber)}
                  >
                    {lcNumber}
                  </button>
                );
              })}
            </div>
          </div>

          <div css={filterFieldStyle}>
            <label css={filterLabelStyle}>Office</label>
            <div css={chipGroupStyle}>
              {offices.map((office) => {
                const isSelected = selectedOffices.includes(office);

                return (
                  <button
                    key={office}
                    type="button"
                    css={[chipStyle, isSelected && chipActiveStyle]}
                    onClick={() => onToggleOffice(office)}
                  >
                    {office}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {filtersActive && (
        <div css={filterFooterStyle} style={{ marginTop: "12px" }}>
          <span>
            Showing {filteredCount} of {totalCount} comments
          </span>
          <button css={clearFiltersButtonStyle} onClick={onClearFilters}>
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
