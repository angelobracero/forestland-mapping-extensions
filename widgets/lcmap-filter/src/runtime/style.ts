import { css } from "jimu-core";

export const filterButtonStyle = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '2px',
  backgroundColor: '#fff',
  // 10px matches the rounded-card radius used elsewhere in this app (e.g.
  // view-feedbacks' comment list) -- was a hard square before.
  borderRadius: '10px',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.18)',
  border: 'none',
  padding: '12px 16px',
  cursor: 'pointer',
  minWidth: '180px',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  transition: 'background 0.15s ease, box-shadow 0.15s ease',

  '&:hover': {
    background: 'linear-gradient(90deg, #0b5e2e 0%, #0d7a3a 100%)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.24)',

    '& span': {
      color: '#fff',
    },
  },
})

export const filterButtonLabelStyle = css({
  fontSize: '1.05rem',
  fontWeight: 600,
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
  // No top padding -- ModalBody already has its own top padding, and
  // stacking this on top of it left an oversized gap above the first
  // child (especially noticeable now that it's the boxed Region/Province
  // line in LayerFilterModal, not a plain label).
  padding: '0 16px 16px',
})

export const fieldStyle = css({
  display: 'flex',
  flexDirection: 'column',
  rowGap: '6px',
})

export const fieldLabelStyle = css({
  fontSize: '0.85rem',
  // Matches content-admin's own form label weight (formLabelStyle) for a
  // consistent look across the app's popups/forms.
  fontWeight: 600,
  color: '#555',
})

// Shown in place of the LC Map Number select when the chosen Region/
// Province has no LC Map published yet -- see LayerFilterModal. Styled
// like the emptyStateStyle used across the other widgets (e.g.
// local-layers-list, about) rather than a heavier callout, to stay
// consistent with how this app already presents "nothing here yet".
export const noMapsMessageStyle = css({
  fontSize: '0.85rem',
  color: '#888',
})

// Read-only confirmation of the Region/Province picked from the sidebar
// (see LayerFilterModal) -- there to answer "did it actually populate?",
// since those two are no longer editable dropdowns here. Styled as pill
// chips, matching view-feedbacks' comment detail chips (same colors/shape)
// for a consistent look across the app.
export const contextChipsStyle = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
})

export const contextChipStyle = css({
  fontSize: '0.78rem',
  fontWeight: 600,
  color: '#0b5e2e',
  backgroundColor: '#e6f3ea',
  padding: '4px 12px',
  borderRadius: '999px',
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
