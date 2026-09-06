import { useState } from "react";
import { UrlManager, getAppStore } from "jimu-core";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "jimu-ui";
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
  deleteButtonStyle,
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

type CommentListProps = {
  comments: FeedbackComment[];
  canDelete: boolean;
  deletingId: number | null;
  onRequestDelete: (objectId: number) => void;
};

export function CommentList({
  comments,
  canDelete,
  deletingId,
  onRequestDelete,
}: CommentListProps) {
  const [selectedComment, setSelectedComment] = useState<FeedbackComment | null>(
    null,
  );

  return (
    <div css={commentsCardStyle}>
      <div css={commentListStyle}>
        {comments.map((item) => (
          <div
            key={item.objectId}
            css={commentItemStyle}
            onClick={() => setSelectedComment(item)}
          >
            <div css={commentAvatarStyle}>{getInitials(item.editor || "?")}</div>
            <div css={commentBodyStyle}>
              <div css={commentHeaderRowStyle}>
                <span css={commentAuthorNameStyle}>{item.editor}</span>
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
                      onClick={(e) => {
                        e.stopPropagation();
                        onRequestDelete(item.objectId);
                      }}
                    >
                      {deletingId === item.objectId ? "…" : "\u{1F5D1}\u{FE0F}"}
                    </button>
                  )}
                </div>
              </div>
              <CommentMetaLine
                parts={[item.region, item.province, item.office, item.lcNumber]}
              />
              <p css={commentTextStyle}>{item.comment}</p>
              {item.attachments.length > 0 && (
                <div
                  css={attachmentListStyle}
                  onClick={(e) => e.stopPropagation()}
                >
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

      {/* Enlarged, easier-to-read view of whichever comment was clicked. */}
      <Modal
        isOpen={selectedComment !== null}
        toggle={() => setSelectedComment(null)}
        centered
        size="lg"
      >
        {selectedComment && (
          <>
            <ModalHeader toggle={() => setSelectedComment(null)}>
              Feedback Comment
            </ModalHeader>
            <ModalBody>
              <div css={commentDetailHeaderRowStyle}>
                <div css={commentDetailAvatarStyle}>
                  {getInitials(selectedComment.editor || "?")}
                </div>
                <div>
                  <div css={commentDetailNameStyle}>
                    {selectedComment.editor || "Anonymous"}
                  </div>
                  <div css={commentDetailDateStyle}>
                    {formatDate(selectedComment.createdDate)}
                  </div>
                </div>
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

              <p css={commentDetailQuoteStyle}>{selectedComment.comment}</p>

              {selectedComment.attachments.length > 0 && (
                <>
                  <div css={commentDetailAttachmentsLabelStyle}>
                    Attachments
                  </div>
                  <div css={attachmentListStyle}>
                    {selectedComment.attachments.map((attachment) => (
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
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                type="primary"
                onClick={() => goToMapForComment(selectedComment)}
              >
                View on Map
              </Button>
            </ModalFooter>
          </>
        )}
      </Modal>
    </div>
  );
}
