import { React, css } from "jimu-core";
import { Loading } from "jimu-ui";
import { createPortal } from "react-dom";

const overlayStyle = css({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(255, 255, 255, 0.55)",
  zIndex: 999,
});

// Full-screen "something is happening" overlay -- a jimu-ui spinner plus a
// message, portaled straight to <body> instead of nested wherever the
// triggering widget sits in Experience Builder's own layout containers, so
// it actually covers the whole screen and blocks interaction with
// everything else while a slow or multi-step operation (a publish, a
// save, a file upload) is in flight. Originally lcmap-filter's own
// map-loading overlay; pulled out here so every widget with a save/upload
// that isn't instant looks and behaves the same way, instead of each one
// only showing a small "Saving..." label buried in a button or field.
export function LoadingOverlay({ text }: { text: string }) {
  return createPortal(
    <div css={overlayStyle}>
      <Loading text={text} />
    </div>,
    document.body,
  );
}
