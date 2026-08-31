import { type AllWidgetProps, getAppStore } from "jimu-core";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Paper, Select, Option, TextInput, enqueueNotification } from "jimu-ui";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import type AttachmentInfo from "@arcgis/core/rest/query/support/AttachmentInfo";

import {
  pageStyle,
  containerStyle,
  headerStyle,
  titleStyle,
  dividerStyle,
  subtitleStyle,
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
  commentAvatarStyle,
  commentBodyStyle,
  commentHeaderRowStyle,
  commentHeaderRightStyle,
  commentAuthorNameStyle,
  commentDateStyle,
  deleteButtonStyle,
  commentSubMetaStyle,
  commentMetaDotStyle,
  commentTextStyle,
  attachmentListStyle,
  attachmentLinkStyle,
  emptyStateStyle,
} from "./style";

const COMMENT_LAYER_PORTAL_ITEM_ID = "f534c711fbdb4837a74ee79de867ffa4";

// Only these exact ArcGIS Online accounts get the delete option, regardless
// of what edit privileges anyone else in the org is granted. To let someone
// else delete comments too, add their AGOL username here (check the
// "Username" field on their profile, not their display name or email).
const DELETE_ALLOWED_USERNAMES = ["albracero"];

type FeedbackComment = {
  objectId: number;
  editor: string;
  office: string;
  comment: string;
  region: string;
  province: string;
  lcNumber: string;
  createdDate: number | null;
  attachments: AttachmentInfo[];
};

type SortOrder = "newest" | "oldest";
type DateRangePreset = "all" | "7d" | "30d" | "90d";

const DATE_RANGE_MS: Record<Exclude<DateRangePreset, "all">, number> = {
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
  "90d": 90 * 24 * 60 * 60 * 1000,
};

// The comment layer's field names/casing aren't fully confirmed (only
// region/province/lc_number are, from the lcmap-filter widget). Look fields
// up case- and punctuation-insensitively instead of guessing exact casing.
// Normalizes a date field's raw value into an epoch-ms timestamp. The
// value from the layer could already be a number, or a date string
// (e.g. ISO format) -- subtracting two raw strings produces NaN, which
// makes Array.prototype.sort() treat every pair as "equal" and silently
// leave the order unchanged.
function toTimestamp(rawValue: unknown): number | null {
  if (rawValue === null || rawValue === undefined || rawValue === "") {
    return null;
  }

  const timestamp =
    typeof rawValue === "number" ? rawValue : new Date(rawValue as string).getTime();

  return Number.isNaN(timestamp) ? null : timestamp;
}

function getFieldValue(
  attributes: Record<string, any>,
  ...candidates: string[]
): any {
  const normalize = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const normalizedCandidates = candidates.map(normalize);

  const key = Object.keys(attributes).find((attributeName) =>
    normalizedCandidates.includes(normalize(attributeName)),
  );

  return key ? attributes[key] : undefined;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "?";

  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function formatDate(value: number | null) {
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

// `comments` must already be sorted by date (see sortedComments) -- that
// order is reused both for the items within each group and, via each
// group's first item, for the groups themselves. Previously groups were
// always ordered alphabetically by province regardless of sortOrder, so
// changing "Sort by date" had no visible effect on province order -- and
// with only one comment per province, there was nothing left to reorder.
function groupByProvince(comments: FeedbackComment[], sortOrder: SortOrder) {
  const groups = new Map<string, FeedbackComment[]>();

  comments.forEach((comment) => {
    const key = comment.province || "Unspecified Province";
    const existing = groups.get(key) ?? [];

    existing.push(comment);
    groups.set(key, existing);
  });

  return [...groups.entries()]
    .map(([province, items]) => ({ province, items }))
    .sort((a, b) => {
      const aTime = a.items[0]?.createdDate ?? 0;
      const bTime = b.items[0]?.createdDate ?? 0;

      return sortOrder === "newest" ? bTime - aTime : aTime - bTime;
    });
}

function Widget(props: AllWidgetProps<any>) {
  const [comments, setComments] = useState<FeedbackComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchText, setSearchText] = useState("");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);
  const [selectedLcNumbers, setSelectedLcNumbers] = useState<string[]>([]);
  const [selectedOffices, setSelectedOffices] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>("all");
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [expandedProvince, setExpandedProvince] = useState<string | null>(
    null,
  );

  // Only DELETE_ALLOWED_USERNAMES gets a delete option on each comment.
  // This is checked against the signed-in user's exact AGOL username
  // (from Experience Builder's own app state), not against general edit
  // privileges -- since this item is shared with the whole org, other
  // members may also have full edit rights, but that must not grant them
  // delete access here.
  const [canDelete, setCanDelete] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const commentLayerRef = useRef<FeatureLayer | null>(null);

  // LOAD COMMENTS FROM THE REAL COMMENT FEATURE LAYER
  useEffect(() => {
    const loadComments = async () => {
      setLoading(true);
      setError(null);

      try {
        const commentLayer = new FeatureLayer({
          portalItem: { id: COMMENT_LAYER_PORTAL_ITEM_ID },
        });

        await commentLayer.load();

        commentLayerRef.current = commentLayer;

        const currentUsername = getAppStore().getState().portalSelf?.user
          ?.username;

        setCanDelete(
          Boolean(
            currentUsername && DELETE_ALLOWED_USERNAMES.includes(currentUsername),
          ),
        );

        const query = commentLayer.createQuery();

        query.where = "1=1";
        query.outFields = ["*"];
        query.returnGeometry = false;

        const result = await commentLayer.queryFeatures(query);

        const items: FeedbackComment[] = result.features.map((feature) => {
          const attributes = feature.attributes;

          return {
            objectId: attributes[commentLayer.objectIdField],
            editor: getFieldValue(attributes, "editor") ?? "",
            office: getFieldValue(attributes, "office") ?? "",
            comment: getFieldValue(attributes, "comment", "comments") ?? "",
            region: getFieldValue(attributes, "region") ?? "",
            province: getFieldValue(attributes, "province") ?? "",
            lcNumber: getFieldValue(attributes, "lc_number", "lcnumber") ?? "",
            createdDate: toTimestamp(
              getFieldValue(
                attributes,
                "created_date",
                "createddate",
                "creationdate",
                "date_created",
                "datecreated",
              ),
            ),
            attachments: [],
          };
        });

        const missingDateCount = items.filter(
          (item) => item.createdDate === null,
        ).length;

        if (missingDateCount > 0) {
          console.warn(
            `${missingDateCount} of ${items.length} feedback comments have no recognizable date field, so sorting by date won't work for them. Raw attributes from the first feature (check field names here):`,
            result.features[0]?.attributes,
          );
        }

        const missingCommentCount = items.filter(
          (item) => !item.comment,
        ).length;

        if (missingCommentCount > 0) {
          console.warn(
            `${missingCommentCount} of ${items.length} feedback comments have no recognizable "comment" field. Raw attributes from the first feature (check field names here):`,
            result.features[0]?.attributes,
          );
        }

        // Attach real attachments (Photos And Files) if the layer supports them.
        if (commentLayer.capabilities?.data?.supportsAttachment && items.length > 0) {
          try {
            const attachmentsByObjectId = await commentLayer.queryAttachments({
              objectIds: items.map((item) => item.objectId),
            });

            items.forEach((item) => {
              item.attachments = attachmentsByObjectId[item.objectId] ?? [];
            });
          } catch (attachmentError) {
            console.error("Failed to load comment attachments:", attachmentError);
          }
        }

        setComments(items);
      } catch (loadError) {
        console.error("Failed to load feedback comments:", loadError);

        setError("Failed to load feedback comments.");
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, []);

  const regions = useMemo(
    () => [...new Set(comments.map((c) => c.region).filter(Boolean))].sort(),
    [comments],
  );

  const provinces = useMemo(() => {
    const source =
      selectedRegions.length > 0
        ? comments.filter((c) => selectedRegions.includes(c.region))
        : comments;

    return [...new Set(source.map((c) => c.province).filter(Boolean))].sort();
  }, [comments, selectedRegions]);

  const lcNumbers = useMemo(() => {
    const source = comments.filter(
      (c) =>
        (selectedRegions.length === 0 || selectedRegions.includes(c.region)) &&
        (selectedProvinces.length === 0 ||
          selectedProvinces.includes(c.province)),
    );

    return [...new Set(source.map((c) => c.lcNumber).filter(Boolean))].sort();
  }, [comments, selectedRegions, selectedProvinces]);

  const offices = useMemo(
    () => [...new Set(comments.map((c) => c.office).filter(Boolean))].sort(),
    [comments],
  );

  const activeChipFilterCount =
    selectedRegions.length +
    selectedProvinces.length +
    selectedLcNumbers.length +
    selectedOffices.length;

  const filtersActive = Boolean(
    searchText.trim() ||
      selectedRegions.length > 0 ||
      selectedProvinces.length > 0 ||
      selectedLcNumbers.length > 0 ||
      selectedOffices.length > 0 ||
      dateRangePreset !== "all",
  );

  const filteredComments = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    const dateCutoff =
      dateRangePreset === "all" ? null : Date.now() - DATE_RANGE_MS[dateRangePreset];

    return comments.filter((c) => {
      if (selectedRegions.length > 0 && !selectedRegions.includes(c.region))
        return false;

      if (
        selectedProvinces.length > 0 &&
        !selectedProvinces.includes(c.province)
      )
        return false;

      if (
        selectedLcNumbers.length > 0 &&
        !selectedLcNumbers.includes(c.lcNumber)
      )
        return false;

      if (selectedOffices.length > 0 && !selectedOffices.includes(c.office))
        return false;

      if (dateCutoff !== null && (c.createdDate === null || c.createdDate < dateCutoff))
        return false;

      if (query) {
        const haystack = `${c.comment} ${c.editor} ${c.office}`.toLowerCase();

        if (!haystack.includes(query)) return false;
      }

      return true;
    });
  }, [
    comments,
    searchText,
    selectedRegions,
    selectedProvinces,
    selectedLcNumbers,
    selectedOffices,
    dateRangePreset,
  ]);

  const sortedComments = useMemo(() => {
    const sorted = [...filteredComments];

    sorted.sort((a, b) => {
      const aTime = a.createdDate ?? 0;
      const bTime = b.createdDate ?? 0;

      return sortOrder === "newest" ? bTime - aTime : aTime - bTime;
    });

    return sorted;
  }, [filteredComments, sortOrder]);

  const groups = useMemo(
    () => groupByProvince(sortedComments, sortOrder),
    [sortedComments, sortOrder],
  );

  const toggleRegion = (region: string) => {
    setSelectedRegions((current) =>
      current.includes(region)
        ? current.filter((r) => r !== region)
        : [...current, region],
    );
    setSelectedProvinces([]);
    setSelectedLcNumbers([]);
  };

  const toggleProvince = (province: string) => {
    setSelectedProvinces((current) =>
      current.includes(province)
        ? current.filter((p) => p !== province)
        : [...current, province],
    );
    setSelectedLcNumbers([]);
  };

  const toggleLcNumber = (lcNumber: string) => {
    setSelectedLcNumbers((current) =>
      current.includes(lcNumber)
        ? current.filter((n) => n !== lcNumber)
        : [...current, lcNumber],
    );
  };

  const toggleOffice = (office: string) => {
    setSelectedOffices((current) =>
      current.includes(office)
        ? current.filter((o) => o !== office)
        : [...current, office],
    );
  };

  const clearFilters = () => {
    setSearchText("");
    setSelectedRegions([]);
    setSelectedProvinces([]);
    setSelectedLcNumbers([]);
    setSelectedOffices([]);
    setDateRangePreset("all");
  };

  const handleDeleteComment = async (objectId: number) => {
    const layer = commentLayerRef.current;

    if (!layer) return;

    const confirmed = window.confirm(
      "Delete this comment? This cannot be undone.",
    );

    if (!confirmed) return;

    setDeletingId(objectId);

    try {
      const result = await layer.applyEdits({
        deleteFeatures: [{ objectId }],
      });

      const failedResult = result.deleteFeatureResults?.find(
        (r) => r.objectId === objectId && r.error,
      );

      if (failedResult?.error) {
        throw failedResult.error;
      }

      setComments((current) => current.filter((c) => c.objectId !== objectId));

      enqueueNotification({
        message: "Comment deleted.",
        severity: "success",
        placement: "bottom-left",
      });
    } catch (deleteError) {
      console.error("Failed to delete comment:", deleteError);

      enqueueNotification({
        message: "Failed to delete comment.",
        severity: "error",
        placement: "bottom-left",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Expanding/collapsing a province group changes the page's height,
  // which can make the browser shift the scroll position on its own.
  // Capture the scroll offset right before the toggle and restore it in
  // a layout effect (runs before the browser paints) so the page stays
  // put instead of jumping.
  const pendingScrollRestoreRef = useRef<number | null>(null);

  const toggleGroup = (province: string) => {
    pendingScrollRestoreRef.current =
      document.scrollingElement?.scrollTop ?? window.scrollY;

    setExpandedProvince((current) =>
      current === province ? null : province,
    );
  };

  useLayoutEffect(() => {
    if (pendingScrollRestoreRef.current === null) return;

    document.scrollingElement?.scrollTo({ top: pendingScrollRestoreRef.current });
    pendingScrollRestoreRef.current = null;
  }, [expandedProvince]);

  return (
    <Paper css={pageStyle} className="jimu-widget" component="main">
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
              <label css={filterLabelStyle}>Sort by date</label>
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
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
                  setDateRangePreset(e.target.value as DateRangePreset)
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
              onClick={() => setFiltersExpanded((current) => !current)}
            >
              {filtersExpanded ? "Hide filters" : "More filters"}
              {activeChipFilterCount > 0 && (
                <span css={filtersToggleCountStyle}>
                  {activeChipFilterCount}
                </span>
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
                        onClick={() => toggleRegion(region)}
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
                        onClick={() => toggleProvince(province)}
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
                        onClick={() => toggleLcNumber(lcNumber)}
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
                        onClick={() => toggleOffice(office)}
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
                Showing {filteredComments.length} of {comments.length}{" "}
                comments
              </span>
              <button css={clearFiltersButtonStyle} onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div css={emptyStateStyle}>Loading feedback...</div>
        ) : error ? (
          <div css={emptyStateStyle}>{error}</div>
        ) : groups.length === 0 ? (
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
                      {group.items.map((item) => (
                        <div key={item.objectId} css={commentItemStyle}>
                          <div css={commentAvatarStyle}>
                            {getInitials(item.editor || "?")}
                          </div>
                          <div css={commentBodyStyle}>
                            <div css={commentHeaderRowStyle}>
                              <span css={commentAuthorNameStyle}>
                                {item.editor}
                              </span>
                              <div css={commentHeaderRightStyle}>
                                <span css={commentDateStyle}>
                                  {formatDate(item.createdDate)}
                                </span>
                                {canDelete && (
                                  <button
                                    type="button"
                                    css={deleteButtonStyle}
                                    aria-label="Delete comment"
                                    disabled={deletingId === item.objectId}
                                    onClick={() =>
                                      handleDeleteComment(item.objectId)
                                    }
                                  >
                                    {deletingId === item.objectId
                                      ? "…"
                                      : "\u{1F5D1}\u{FE0F}"}
                                  </button>
                                )}
                              </div>
                            </div>
                            <div css={commentSubMetaStyle}>
                              <span>{item.office}</span>
                              {item.lcNumber && (
                                <>
                                  <span css={commentMetaDotStyle}>
                                    &middot;
                                  </span>
                                  <span>{item.lcNumber}</span>
                                </>
                              )}
                            </div>
                            <p css={commentTextStyle}>{item.comment}</p>
                            {item.attachments.length > 0 && (
                              <div css={attachmentListStyle}>
                                {item.attachments.map((attachment) => (
                                  <a
                                    key={attachment.id}
                                    css={attachmentLinkStyle}
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    &#128206; {attachment.name}
                                  </a>
                                ))}
                              </div>
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
