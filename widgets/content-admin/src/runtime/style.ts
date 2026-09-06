import { css } from "jimu-core";

export const containerStyle = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  maxWidth: '900px',
  margin: '0 auto',
  padding: '56px 24px',
  boxSizing: 'border-box',
  minHeight: 'calc(100dvh - 40px)',
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

export const deniedStyle = css({
  textAlign: 'center',
  color: '#888',
  padding: '64px 24px',
  fontSize: '1rem',
})

export const tabBarStyle = css({
  display: 'flex',
  gap: '24px',
  borderBottom: '1px solid #eee',
})

export const tabButtonStyle = css({
  background: 'none',
  border: 'none',
  borderBottom: '3px solid transparent',
  padding: '10px 2px',
  fontSize: '0.95rem',
  fontWeight: 600,
  color: '#666',
  cursor: 'pointer',
})

export const tabButtonActiveStyle = css({
  color: '#0b5e2e',
  borderBottomColor: '#0b5e2e',
})

export const sectionStyle = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
})

export const sectionHeaderStyle = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
})

export const sectionTitleStyle = css({
  margin: 0,
  fontSize: '1.1rem',
  fontWeight: 700,
  color: '#222',
})

export const addButtonStyle = css({
  background: '#0b5e2e',
  border: 'none',
  borderRadius: '6px',
  padding: '10px 18px',
  fontSize: '0.9rem',
  fontWeight: 600,
  color: '#fff',
  cursor: 'pointer',

  '&:hover': {
    backgroundColor: '#0d7a3a',
  },
})

export const emptyStateStyle = css({
  textAlign: 'center',
  color: '#888',
  padding: '32px 0',
})

export const rowListStyle = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
})

export const rowItemStyle = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  backgroundColor: '#fff',
  border: '1px solid #eee',
  borderRadius: '8px',
  padding: '12px 16px',
})

export const rowInfoStyle = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  minWidth: 0,
})

export const rowTitleStyle = css({
  fontSize: '0.95rem',
  fontWeight: 600,
  color: '#222',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

export const rowMetaStyle = css({
  fontSize: '0.8rem',
  color: '#888',
})

export const rowActionsStyle = css({
  display: 'flex',
  gap: '4px',
  flexShrink: 0,
})

export const rowActionButtonStyle = css({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '0.85rem',
  fontWeight: 600,
  padding: '6px 10px',
  borderRadius: '4px',
})

export const editActionButtonStyle = css({
  color: '#0b5e2e',

  '&:hover': {
    backgroundColor: '#e6f3ea',
  },
})

export const deleteActionButtonStyle = css({
  color: '#c0392b',

  '&:hover': {
    backgroundColor: '#fdecea',
  },
})

export const formFieldStyle = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  marginBottom: '14px',
})

export const formLabelStyle = css({
  fontSize: '0.85rem',
  fontWeight: 600,
  color: '#555',
})

export const uploadRowStyle = css({
  display: 'flex',
  gap: '8px',
  alignItems: 'flex-start',
})

export const currentValueStyle = css({
  padding: '8px 10px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  backgroundColor: '#f7f7f7',
  fontSize: '0.85rem',
  color: '#666',
  wordBreak: 'break-all',
  minHeight: '20px',
})

export const uploadButtonStyle = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px 14px',
  borderRadius: '4px',
  border: '1px solid #0b5e2e',
  color: '#0b5e2e',
  fontSize: '0.85rem',
  fontWeight: 600,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  flexShrink: 0,

  '&:hover': {
    backgroundColor: '#e6f3ea',
  },
})

export const nativeInputStyle = css({
  padding: '8px 10px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  fontSize: '0.9rem',
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
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
