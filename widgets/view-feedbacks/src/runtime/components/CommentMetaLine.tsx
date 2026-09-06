import { Fragment } from "react";
import { commentSubMetaStyle, commentMetaDotStyle } from "../style";

// Renders a comment's region/province/office/LC number as a single
// dot-separated line, skipping any fields the comment doesn't have.
export function CommentMetaLine({ parts }: { parts: string[] }) {
  const visibleParts = parts.filter(Boolean);

  return (
    <div css={commentSubMetaStyle}>
      {visibleParts.map((part, index) => (
        <Fragment key={index}>
          {index > 0 && <span css={commentMetaDotStyle}>&middot;</span>}
          <span>{part}</span>
        </Fragment>
      ))}
    </div>
  );
}
