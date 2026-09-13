import { css } from "jimu-core";

export const pageStyle = css({
  minHeight: 'calc(100dvh - 40px)',
  boxSizing: 'border-box',
})

export const containerStyle = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '32px',
  maxWidth: '860px',
  margin: '0 auto',
  padding: '56px 24px',
  boxSizing: 'border-box',
})

export const headerStyle = css({
  textAlign: 'center',
})

export const titleStyle = css({
  fontSize: '2.25rem',
  fontWeight: 700,
  color: '#0b5e2e',
  lineHeight: 1.3,
  margin: 0,

  '@media (max-width: 600px)': {
    fontSize: '1.6rem',
  },
})

export const dividerStyle = css({
  width: '64px',
  height: '4px',
  borderRadius: '2px',
  backgroundColor: '#ffcc00',
  margin: '16px auto 0',
})

export const subtitleStyle = css({
  fontSize: '1.05rem',
  color: '#555',
  marginTop: '16px',
  maxWidth: '640px',
  marginLeft: 'auto',
  marginRight: 'auto',
  lineHeight: 1.6,
})

export const filterBarStyle = css({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-end',
  gap: '16px',
})

export const filterFieldStyle = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  minWidth: '180px',
})

export const searchFieldStyle = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  flex: '1 1 240px',
})

export const filterLabelStyle = css({
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#555',
})

export const filtersToggleStyle = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  alignSelf: 'flex-end',
  background: '#fff',
  border: '1px solid #ddd',
  borderRadius: '8px',
  padding: '9px 16px',
  fontSize: '0.85rem',
  fontWeight: 600,
  color: '#0b5e2e',
  cursor: 'pointer',
  transition: 'border-color 0.15s ease',

  '&:hover': {
    borderColor: '#0b5e2e',
  },
})

export const filtersToggleCountStyle = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '18px',
  height: '18px',
  padding: '0 5px',
  borderRadius: '999px',
  backgroundColor: '#0b5e2e',
  color: '#fff',
  fontSize: '0.72rem',
  fontWeight: 700,
})

// Segmented Unresolved/Resolved control (content admins only) -- like a
// typical issue-tracker's Open/Closed tabs, instead of a toggle that
// merges resolved comments into the same list.
export const resolvedTabsStyle = css({
  display: 'inline-flex',
  alignSelf: 'flex-end',
  border: '1px solid #ddd',
  borderRadius: '8px',
  overflow: 'hidden',
})

export const resolvedTabButtonStyle = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  background: '#fff',
  border: 'none',
  padding: '9px 16px',
  fontSize: '0.85rem',
  fontWeight: 600,
  color: '#555',
  cursor: 'pointer',
  transition: 'background-color 0.15s ease, color 0.15s ease',

  '&:not(:last-of-type)': {
    borderRight: '1px solid #ddd',
  },

  '&:hover': {
    backgroundColor: '#f7faf8',
  },
})

export const resolvedTabButtonActiveStyle = css({
  backgroundColor: '#0b5e2e',
  color: '#fff',

  '&:hover': {
    backgroundColor: '#0b5e2e',
  },
})

export const resolvedTabCountStyle = css({
  fontSize: '0.78rem',
  fontWeight: 700,
  opacity: 0.75,
})

// Applied to a resolved comment's row instead of a text badge -- the row
// sits inside commentsCardStyle, which already clips its children to a
// 10px border-radius (see `overflow: hidden` there), so this plain
// border automatically comes out rounded on the first/last row and
// straight everywhere else, with no extra rounding needed here.
export const resolvedItemAccentStyle = css({
  borderLeft: '4px solid #0b5e2e',
  paddingLeft: '16px',
})

export const chipFiltersStyle = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  marginTop: '20px',
})

export const chipGroupStyle = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
})

export const chipStyle = css({
  background: '#fff',
  border: '1px solid #ddd',
  borderRadius: '999px',
  padding: '6px 14px',
  fontSize: '0.85rem',
  fontWeight: 500,
  color: '#444',
  cursor: 'pointer',
  transition: 'all 0.15s ease',

  '&:hover': {
    borderColor: '#0b5e2e',
    color: '#0b5e2e',
  },
})

export const chipActiveStyle = css({
  background: '#0b5e2e',
  borderColor: '#0b5e2e',
  color: '#fff',

  '&:hover': {
    borderColor: '#0b5e2e',
    color: '#fff',
  },
})

export const filterFooterStyle = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontSize: '0.85rem',
  color: '#888',
})

export const clearFiltersButtonStyle = css({
  background: 'none',
  border: 'none',
  padding: 0,
  color: '#0b5e2e',
  fontWeight: 600,
  fontSize: '0.85rem',
  cursor: 'pointer',
  textDecoration: 'underline',
})

export const commentsCardStyle = css({
  backgroundColor: '#fff',
  borderRadius: '10px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
  overflow: 'hidden',
})

export const commentListStyle = css({
  display: 'flex',
  flexDirection: 'column',
  borderTop: '1px solid #eee',
})

export const commentItemStyle = css({
  display: 'flex',
  gap: '14px',
  padding: '18px 20px',
  alignItems: 'flex-start',
  cursor: 'pointer',

  '&:not(:last-of-type)': {
    borderBottom: '1px solid #f0f0f0',
  },

  '&:hover': {
    backgroundColor: '#f7faf8',
  },
})

export const commentAvatarStyle = css({
  flexShrink: 0,
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #0b5e2e 0%, #0d7a3a 100%)',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.9rem',
  fontWeight: 700,
  textTransform: 'uppercase',
})

export const commentBodyStyle = css({
  flex: 1,
  minWidth: 0,
})

export const commentHeaderRowStyle = css({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: '8px 12px',
})

export const commentAuthorNameStyle = css({
  fontSize: '0.92rem',
  fontWeight: 600,
  color: '#1a1a1a',
})

export const commentDateStyle = css({
  fontSize: '0.78rem',
  color: '#999',
  whiteSpace: 'nowrap',
})

export const commentHeaderRightStyle = css({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
})

export const commentIconButtonStyle = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '28px',
  height: '28px',
  flexShrink: 0,
  background: 'none',
  border: 'none',
  color: '#999',
  cursor: 'pointer',
  borderRadius: '6px',
  transition: 'color 0.15s ease, background-color 0.15s ease',

  '&:disabled': {
    cursor: 'default',
    opacity: 0.6,
  },
})

export const deleteButtonStyle = css({
  '&:hover': {
    color: '#c0392b',
    backgroundColor: '#fdecea',
  },
})

export const resolveButtonStyle = css({
  '&:hover': {
    color: '#0b5e2e',
    backgroundColor: '#e6f3ea',
  },
})

export const commentIconStyle = css({
  width: '16px',
  height: '16px',
  flexShrink: 0,

  '& path': {
    fill: 'currentColor',
  },
})

export const resolvedBadgeStyle = css({
  display: 'inline-flex',
  alignItems: 'center',
  fontSize: '0.72rem',
  fontWeight: 700,
  color: '#0b5e2e',
  backgroundColor: '#e6f3ea',
  borderRadius: '999px',
  padding: '2px 10px',
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
})

export const commentSubMetaStyle = css({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '6px',
  marginTop: '2px',
  fontSize: '0.8rem',
  color: '#888',
})

export const commentMetaDotStyle = css({
  color: '#ccc',
})

export const commentTextStyle = css({
  fontSize: '0.95rem',
  color: '#222',
  lineHeight: 1.6,
  margin: '8px 0 0',
})

// Wraps the portion of text matching the active search box query (see
// HighlightedText in CommentList.tsx) -- only ever applied to the fields
// search actually matches against (comment/editor), so a highlight
// always explains why that comment is in the results.
export const searchHighlightStyle = css({
  backgroundColor: '#fff3b0',
  color: 'inherit',
  borderRadius: '2px',
  padding: '0 1px',
})

// Enlarged read-only view of a single comment, opened by clicking its card.
export const commentDetailHeaderRowStyle = css({
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  marginBottom: '18px',
})

export const commentDetailAvatarStyle = css({
  flexShrink: 0,
  width: '52px',
  height: '52px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #0b5e2e 0%, #0d7a3a 100%)',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.1rem',
  fontWeight: 600,
})

export const commentDetailNameStyle = css({
  fontSize: '1.05rem',
  fontWeight: 700,
  color: '#1a1a1a',
})

export const commentDetailDateStyle = css({
  fontSize: '0.85rem',
  color: '#999',
  marginTop: '2px',
})

export const commentDetailChipsStyle = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  marginBottom: '20px',
})

export const commentDetailChipStyle = css({
  fontSize: '0.78rem',
  fontWeight: 600,
  color: '#0b5e2e',
  backgroundColor: '#e6f3ea',
  padding: '4px 12px',
  borderRadius: '999px',
})

export const commentDetailQuoteStyle = css({
  fontSize: '1.05rem',
  color: '#222',
  lineHeight: 1.75,
  whiteSpace: 'pre-wrap',
  backgroundColor: '#f7faf8',
  borderLeft: '4px solid #0b5e2e',
  borderRadius: '0 8px 8px 0',
  padding: '16px 20px',
  margin: 0,
})

export const commentDetailAttachmentsLabelStyle = css({
  fontSize: '0.78rem',
  fontWeight: 700,
  color: '#888',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginTop: '22px',
  marginBottom: '8px',
})

export const attachmentListStyle = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  marginTop: '10px',
})

export const attachmentLinkStyle = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '0.78rem',
  color: '#0b5e2e',
  backgroundColor: '#e6f3ea',
  borderRadius: '999px',
  padding: '2px 8px',
  textDecoration: 'none',
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'inherit',

  '&:hover': {
    textDecoration: 'underline',
  },
})

// Full-screen preview for image attachments, opened instead of the
// browser's own (small, black-background) image tab -- same overlay
// pattern as gad-gallery/guides-and-tutorials's photo lightbox.
export const attachmentOverlayStyle = css({
  position: 'fixed',
  top: '40px',
  right: 0,
  bottom: 0,
  left: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  boxSizing: 'border-box',
  // Higher than jimu-ui's own Modal (this overlay opens from inside the
  // comment detail Modal, and both are now portaled to <body> as
  // siblings -- see the createPortal call in CommentList.tsx -- so it
  // needs to clearly outrank the Modal's z-index, not just the other
  // in-widget lightboxes' 10000).
  zIndex: 100000,
  cursor: 'zoom-out',

  '@keyframes attachmentOverlayFadeIn': {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  animation: 'attachmentOverlayFadeIn 0.2s ease',
})

export const attachmentOverlayImageStyle = css({
  maxWidth: '90vw',
  maxHeight: 'calc(100dvh - 40px - 120px)',
  objectFit: 'contain',
  borderRadius: '8px',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
  cursor: 'default',

  '@keyframes attachmentOverlayZoomIn': {
    from: { transform: 'scale(0.85)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
  },
  animation: 'attachmentOverlayZoomIn 0.25s ease',
})

export const attachmentOverlayCaptionStyle = css({
  color: '#fff',
  textAlign: 'center',
  fontSize: '0.9rem',
  marginTop: '16px',
  cursor: 'default',
})

export const emptyStateStyle = css({
  textAlign: 'center',
  color: '#888',
  padding: '32px 0',
})

export const confirmDialogBodyStyle = css({
  fontSize: '0.95rem',
  color: '#333',
  lineHeight: 1.6,
})

// Caps every popup to the space actually left below the app's 40px sticky
// header -- without this, a modal (which is centered against the full
// viewport height) can grow tall enough to sit behind/under the header.
export const modalDialogStyle = css({
  maxHeight: 'calc(100dvh - 40px)',
  overflowY: 'auto',
})

// jimu-ui's Modal only exposes its outer full-viewport wrapper (the one
// that needs repositioning below the header) through the plain string
// `modalClassName` prop, not the `css` prop -- so this pairs a real class
// name with a small stylesheet injected via a <style> tag next to the
// Modal, the same way the image lightbox overlays (gad-gallery,
// guides-and-tutorials) are positioned to start below the 40px header
// instead of covering it.
export const MODAL_BELOW_HEADER_CLASS = 'fem-modal-below-header'

export const modalBelowHeaderCss = `
  .${MODAL_BELOW_HEADER_CLASS} {
    top: 40px !important;
    height: calc(100dvh - 40px) !important;
  }
`
