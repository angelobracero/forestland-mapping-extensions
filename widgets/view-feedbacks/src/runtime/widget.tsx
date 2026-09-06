import { type AllWidgetProps, getAppStore } from "jimu-core";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Paper,
  enqueueNotification,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "jimu-ui";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import { checkIsContentAdmin } from "widgets/shared-code/admin-auth";
import { getFieldValue } from "widgets/shared-code/field-utils";

import {
  pageStyle,
  containerStyle,
  headerStyle,
  titleStyle,
  dividerStyle,
  subtitleStyle,
  emptyStateStyle,
  confirmDialogBodyStyle,
} from "./style";
import {
  type FeedbackComment,
  type SortOrder,
  type DateRangePreset,
  DATE_RANGE_MS,
  toTimestamp,
} from "./feedback";
import { FeedbackFilters } from "./components/FeedbackFilters";
import { CommentList } from "./components/CommentList";

const COMMENT_LAYER_PORTAL_ITEM_ID = "f534c711fbdb4837a74ee79de867ffa4";

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

  // Only content admins (super admins, or anyone listed in the
  // app_admins table -- see widgets/shared-code/admin-auth.ts) get a
  // delete option on each comment. This is checked against the signed-in
  // user's exact AGOL username (from Experience Builder's own app state),
  // not against general edit privileges -- since this item is shared with
  // the whole org, other members may also have full edit rights, but that
  // must not grant them delete access here.
  const [canDelete, setCanDelete] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
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

        setCanDelete(await checkIsContentAdmin(currentUsername));

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

  const requestDeleteComment = (objectId: number) => {
    setPendingDeleteId(objectId);
  };

  const cancelDeleteComment = () => {
    setPendingDeleteId(null);
  };

  const confirmDeleteComment = async () => {
    const layer = commentLayerRef.current;
    const objectId = pendingDeleteId;

    setPendingDeleteId(null);

    if (!layer || objectId === null) return;

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

  return (
    <Paper css={pageStyle} className="jimu-widget" component="main">
      <div css={containerStyle}>
        <div css={headerStyle}>
          <h2 css={titleStyle}>View Feedbacks</h2>
          <div css={dividerStyle} />
          <p css={subtitleStyle}>
            Summary of comments submitted on the Proposed LC Maps.
          </p>
        </div>

        <FeedbackFilters
          searchText={searchText}
          onSearchTextChange={setSearchText}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          dateRangePreset={dateRangePreset}
          onDateRangePresetChange={setDateRangePreset}
          filtersExpanded={filtersExpanded}
          onToggleFiltersExpanded={() =>
            setFiltersExpanded((current) => !current)
          }
          activeChipFilterCount={activeChipFilterCount}
          regions={regions}
          provinces={provinces}
          lcNumbers={lcNumbers}
          offices={offices}
          selectedRegions={selectedRegions}
          selectedProvinces={selectedProvinces}
          selectedLcNumbers={selectedLcNumbers}
          selectedOffices={selectedOffices}
          onToggleRegion={toggleRegion}
          onToggleProvince={toggleProvince}
          onToggleLcNumber={toggleLcNumber}
          onToggleOffice={toggleOffice}
          filtersActive={filtersActive}
          filteredCount={filteredComments.length}
          totalCount={comments.length}
          onClearFilters={clearFilters}
        />

        {loading ? (
          <div css={emptyStateStyle}>Loading feedback...</div>
        ) : error ? (
          <div css={emptyStateStyle}>{error}</div>
        ) : sortedComments.length === 0 ? (
          <div css={emptyStateStyle}>
            {filtersActive
              ? "No feedback matches your filters."
              : "No feedback submitted yet."}
          </div>
        ) : (
          <CommentList
            comments={sortedComments}
            canDelete={canDelete}
            deletingId={deletingId}
            onRequestDelete={requestDeleteComment}
          />
        )}
      </div>

      <Modal isOpen={pendingDeleteId !== null} toggle={cancelDeleteComment} centered>
        <ModalHeader toggle={cancelDeleteComment}>Delete comment</ModalHeader>
        <ModalBody>
          <p css={confirmDialogBodyStyle}>
            Delete this comment? This cannot be undone.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button type="default" onClick={cancelDeleteComment}>
            Cancel
          </Button>
          <Button type="danger" onClick={confirmDeleteComment}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </Paper>
  );
}

export default Widget;
