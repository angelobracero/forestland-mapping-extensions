import { css } from "jimu-core";

// Matches lcmap-filter's "Choose a Layer" button (same widget family, same
// map) so the two controls read as one consistent design instead of one
// looking like a bold call-to-action next to a plain white card. Fills the
// widget's own placement on the page (width/height 100%) rather than
// shrinking to fit its text.
export const previewButtonStyle = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',
  gap: '2px',
  width: '100%',
  height: '100%',
  boxSizing: 'border-box',
  backgroundColor: '#fff',
  borderRadius: 0,
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.18)',
  border: 'none',
  padding: '12px 16px',
  cursor: 'pointer',
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

export const previewButtonLabelStyle = css({
  fontSize: '1.05rem',
  fontWeight: 400,
  color: '#222',
})

export const previewButtonSubtitleStyle = css({
  fontSize: '0.8rem',
  color: '#666',
})
