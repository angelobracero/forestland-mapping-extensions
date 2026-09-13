import { Fragment, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type AttachmentInfo from "@arcgis/core/rest/query/support/AttachmentInfo";
import { UrlManager, getAppStore } from "jimu-core";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "jimu-ui";
import { CheckOutlined } from "jimu-icons/outlined/application/check";
import { ArrowUndoOutlined } from "jimu-icons/outlined/directional/arrow-undo";
import { TrashOutlined } from "jimu-icons/outlined/editor/trash";
import { setPendingCommentTarget } from "widgets/shared-code/comment-navigation-store";
import { type FeedbackComment, getInitials, formatDate } from "../feedback";
import { CommentMetaLine } from "./CommentMetaLine";
import {
  commentsCardStyle,
  commentListStyle,
  commentItemStyle,
  commentAvatarStyle,
  commentBodyStyle,
  commentHeaderRowStyle,
  commentHeaderRightStyle,
  commentAuthorNameStyle,
  commentDateStyle,
  commentIconButtonStyle,
  commentIconStyle,
  deleteButtonStyle,
  resolveButtonStyle,
  resolvedBadgeStyle,
  resolvedItemAccentStyle,
  searchHighlightStyle,
  commentTextStyle,
  commentDetailHeaderRowStyle,
  commentDetailAvatarStyle,
  commentDetailNameStyle,
  commentDetailDateStyle,
  commentDetailChipsStyle,
  commentDetailChipStyle,
  commentDetailQuoteStyle,
  commentDetailAttachmentsLabelStyle,
  attachmentListStyle,
  attachmentLinkStyle,
  attachmentOverlayStyle,
  attachmentOverlayImageStyle,
  attachmentOverlayCaptionStyle,
  modalDialogStyle,
  MODAL_BELOW_HEADER_CLASS,
  modalBelowHeaderCss,
} from "../style";

// Must match the page label used in forestland-menu's own nav link for the
// same page -- pages are looked up by label, not a hardcoded page id.
const PROPOSED_LC_MAPS_PAGE_LABEL = "Proposed LC Maps";

// Hands off which comment to jump to (see widgets/shared-code/
// comment-navigation-store.ts), then navigates to the Proposed LC Maps
// page, where lcmap-filter picks up the pending target: auto-selecting
// that Region/Province/LC Number and zooming to this specific comment.
function goToMapForComment(comment: FeedbackComment): void {
  setPendingCommentTarget({
    objectId: comment.objectId,
    region: comment.region,
    province: comment.province,
    lcNumber: comment.lcNumber,
  });

  const { pages } = getAppStore().getState().appConfig;
  const page = Object.values(pages).find(
    (p) => p.label === PROPOSED_LC_MAPS_PAGE_LABEL,
  );

  if (!page) {
    console.warn(
      `view-feedbacks: no page found named "${PROPOSED_LC_MAPS_PAGE_LABEL}".`,
    );

    return;
  }

  UrlManager.getInstance().changePage(page.id);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Wraps the portion of `text` matching the active search box query in
// <mark> -- only ever applied to fields the search box actually matches
// against (comment/editor), so a highlight always explains why that
// comment is in the current results.
function HighlightedText({ text, query }: { text: string; query: string }) {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return <>{text}</>;
  }

  const segments = text.split(
    new RegExp(`(${escapeRegExp(trimmedQuery)})`, "gi"),
  );

  return (
    <>
      {segments.map((segment, index) =>
        segment.toLowerCase() === trimmedQuery.toLowerCase() ? (
          <mark key={index} css={searchHighlightStyle}>
            {segment}
          </mark>
        ) : (
          <Fragment key={index}>{segment}</Fragment>
        ),
      )}
    </>
  );
}

function isImageAttachment(attachment: AttachmentInfo): boolean {
  return attachment.contentType?.startsWith("image/") ?? false;
}

// Renders one comment's attachment chips. Images open the in-app preview
// (via onPreview) instead of the browser's own new-tab image viewer; other
// file types (PDFs, docs, etc.) still open in a new tab, which is the
// right behavior for those.
function AttachmentChips({
  attachments,
  onPreview,
}: {
  attachments: AttachmentInfo[];
  onPreview: (attachment: AttachmentInfo) => void;
}) {
  return (
    <div css={attachmentListStyle} onClick={(e) => e.stopPropagation()}>
      {attachments.map((attachment) =>
        isImageAttachment(attachment) ? (
          <button
            key={attachment.id}
            type="button"
            css={attachmentLinkStyle}
            onClick={() => onPreview(attachment)}
          >
            &#128206; {attachment.name}
          </button>
        ) : (
          <a
            key={attachment.id}
            css={attachmentLinkStyle}
            href={attachment.url}
            target="_blank"
            rel="noreferrer"
          >
            &#128206; {attachment.name}
          </a>
        ),
      )}
    </div>
  );
}

type CommentListProps = {
  comments: FeedbackComment[];
  canDelete: boolean;
  deletingId: number | null;
  onRequestDelete: (objectId: number) => void;
  canManageResolved: boolean;
  updatingResolvedId: number | null;
  onToggleResolved: (comment: FeedbackComment) => void;
  searchText: string;
};

export function CommentList({
  comments,
  canDelete,
  deletingId,
  onRequestDelete,
  canManageResolved,
  updatingResolvedId,
  onToggleResolved,
  searchText,
}: CommentListProps) {
  // Tracked by id (not the comment object itself) so the popup stays in
  // sync if its resolved status changes while open -- e.g. toggling
  // "Mark resolved" from inside the popup itself, below.
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(
    null,
  );
  const selectedComment =
    selectedCommentId !== null
      ? (comments.find((c) => c.objectId === selectedCommentId) ?? null)
      : null;
  const [previewAttachment, setPreviewAttachment] =
    useState<AttachmentInfo | null>(null);

  useEffect(() => {
    if (!previewAttachment) {
      return;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPreviewAttachment(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previewAttachment]);

  return (
    <div css={commentsCardStyle}>
      <div css={commentListStyle}>
        {comments.map((item) => (
          <div
            key={item.objectId}
            css={[commentItemStyle, item.resolved && resolvedItemAccentStyle]}
            onClick={() => setSelectedCommentId(item.objectId)}
          >
            <div css={commentAvatarStyle}>{getInitials(item.editor || "?")}</div>
            <div css={commentBodyStyle}>
              <div css={commentHeaderRowStyle}>
                <span css={commentAuthorNameStyle}>
                  <HighlightedText text={item.editor} query={searchText} />
                </span>
                <div css={commentHeaderRightStyle}>
                  <span css={commentDateStyle}>
                    {formatDate(item.createdDate)}
                  </span>
                  {canManageResolved && (
                    <button
                      type="button"
                      css={[commentIconButtonStyle, resolveButtonStyle]}
                      aria-label={
                        item.resolved ? "Mark comment unresolved" : "Mark comment resolved"
                      }
                      title={item.resolved ? "Mark unresolved" : "Mark resolved"}
                      disabled={updatingResolvedId === item.objectId}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleResolved(item);
                      }}
                    >
                      {item.resolved ? (
                        <ArrowUndoOutlined css={commentIconStyle} />
                      ) : (
                        <CheckOutlined css={commentIconStyle} />
                      )}
                    </button>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      css={[commentIconButtonStyle, deleteButtonStyle]}
                      aria-label="Delete comment"
                      title="Delete comment"
                      disabled={deletingId === item.objectId}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRequestDelete(item.objectId);
                      }}
                    >
                      <TrashOutlined css={commentIconStyle} />
                    </button>
                  )}
                </div>
              </div>
              <CommentMetaLine
                parts={[item.region, item.province, item.office, item.lcNumber]}
              />
              <p css={commentTextStyle}>
                <HighlightedText text={item.comment} query={searchText} />
              </p>
              {item.attachments.length > 0 && (
                <AttachmentChips
                  attachments={item.attachments}
                  onPreview={setPreviewAttachment}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Enlarged, easier-to-read view of whichever comment was clicked. */}
      <style>{modalBelowHeaderCss}</style>

      <Modal
        isOpen={selectedComment !== null}
        toggle={() => setSelectedCommentId(null)}
        centered
        size="lg"
        css={modalDialogStyle}
        modalClassName={MODAL_BELOW_HEADER_CLASS}
      >
        {selectedComment && (
          <>
            <ModalHeader toggle={() => setSelectedCommentId(null)}>
              Comment
            </ModalHeader>
            <ModalBody>
              <div css={commentDetailHeaderRowStyle}>
                <div css={commentDetailAvatarStyle}>
                  {getInitials(selectedComment.editor || "?")}
                </div>
                <div>
                  <div css={commentDetailNameStyle}>
                    <HighlightedText
                      text={selectedComment.editor || "Anonymous"}
                      query={searchText}
                    />
                  </div>
                  <div css={commentDetailDateStyle}>
                    {formatDate(selectedComment.createdDate)}
                  </div>
                </div>
                {selectedComment.resolved && (
                  <span css={resolvedBadgeStyle} style={{ marginLeft: "auto" }}>
                    Resolved
                  </span>
                )}
              </div>

              <div css={commentDetailChipsStyle}>
                {[
                  selectedComment.region,
                  selectedComment.province,
                  selectedComment.office,
                  selectedComment.lcNumber,
                ]
                  .filter(Boolean)
                  .map((value) => (
                    <span key={value} css={commentDetailChipStyle}>
                      {value}
                    </span>
                  ))}
              </div>

              <p css={commentDetailQuoteStyle}>
                <HighlightedText text={selectedComment.comment} query={searchText} />
              </p>

              {selectedComment.attachments.length > 0 && (
                <>
                  <div css={commentDetailAttachmentsLabelStyle}>
                    Attachments
                  </div>
                  <AttachmentChips
                    attachments={selectedComment.attachments}
                    onPreview={setPreviewAttachment}
                  />
                </>
              )}
            </ModalBody>
            <ModalFooter>
              {canManageResolved && (
                <Button
                  type="default"
                  disabled={updatingResolvedId === selectedComment.objectId}
                  onClick={() => onToggleResolved(selectedComment)}
                >
                  {updatingResolvedId === selectedComment.objectId
                    ? "…"
                    : selectedComment.resolved
                      ? "Mark unresolved"
                      : "Mark resolved"}
                </Button>
              )}
              <Button
                type="primary"
                onClick={() => {
                  setSelectedCommentId(null);
                  goToMapForComment(selectedComment);
                }}
              >
                View on Map
              </Button>
            </ModalFooter>
          </>
        )}
      </Modal>

      {previewAttachment &&
        createPortal(
          // Rendered straight to <body> (same as lcmap-filter's map-loading
          // overlay) instead of nested inside the comment detail Modal's
          // own stacking context -- otherwise this "fixed" overlay ends up
          // trapped behind the Modal instead of on top of it.
          <div
            css={attachmentOverlayStyle}
            onClick={() => setPreviewAttachment(null)}
          >
            <img
              css={attachmentOverlayImageStyle}
              src={previewAttachment.url}
              alt={previewAttachment.name}
              onClick={(e) => e.stopPropagation()}
            />
            <div css={attachmentOverlayCaptionStyle}>
              {previewAttachment.name}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
