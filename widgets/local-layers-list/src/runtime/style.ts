import { css } from "jimu-core";

export const listContainerStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  width: "100%",
  height: "100%",
  backgroundColor: "#fff",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.18)",
  padding: "8px 12px",
  boxSizing: "border-box",
})

export const titleStyle = css({
  fontSize: "0.95rem",
  fontWeight: 600,
  color: "#222",
  flexShrink: 0,
})

export const rowListStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
})

export const emptyStateStyle = css({
  fontSize: "0.85rem",
  color: "#888",
  padding: "8px 0",
})

export const layerRowStyle = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "8px",
  fontSize: "0.85rem",
  color: "#333",
})

export const layerNameButtonStyle = css({
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 0,
  textAlign: "left",
  color: "#333",
  fontSize: "0.85rem",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  minWidth: 0,

  "&:hover": {
    textDecoration: "underline",
    color: "#0b5e2e",
  },
})

export const removeLinkStyle = css({
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#666",
  fontSize: "0.85rem",
  textDecoration: "underline",
  flexShrink: 0,
})
