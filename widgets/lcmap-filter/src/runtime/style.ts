import { css } from "jimu-core";

export const filterButtonStyle = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '2px',
  backgroundColor: '#fff',
  borderRadius: 0,
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.18)',
  border: 'none',
  padding: '12px 16px',
  cursor: 'pointer',
  minWidth: '180px',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  transition: 'background 0.15s ease',

  '&:hover': {
    background: 'linear-gradient(90deg, #0b5e2e 0%, #0d7a3a 100%)',

    '& span': {
      color: '#fff',
    },
  },
})

export const filterButtonLabelStyle = css({
  fontSize: '1.05rem',
  fontWeight: 400,
  color: '#222',
})

export const filterButtonSubtitleStyle = css({
  fontSize: '0.8rem',
  color: '#666',
})

export const filterContainerStyle = css({
  display: 'flex',
  flexDirection: 'column',
  rowGap: '14px',
  padding: '16px',
})

export const fieldStyle = css({
  display: 'flex',
  flexDirection: 'column',
  rowGap: '6px',
})

export const fieldLabelStyle = css({
  fontSize: '0.85rem',
  fontWeight: 400,
  color: '#555',
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
