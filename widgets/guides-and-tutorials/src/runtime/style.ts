import { css } from "jimu-core";

export const containerStyle = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '56px',
  maxWidth: '980px',
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

// ------------------------------------------------------------------
// Section 1: Introduction / feature overview
// ------------------------------------------------------------------

export const sectionStyle = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
})

export const sectionTitleStyle = css({
  fontSize: '1.6rem',
  fontWeight: 700,
  color: '#0b5e2e',
  margin: 0,
})

export const sectionIntroStyle = css({
  fontSize: '1rem',
  color: '#444',
  lineHeight: 1.7,
  margin: 0,
  maxWidth: '760px',
})

export const featureGridStyle = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: '20px',
})

export const featureCardStyle = css({
  backgroundColor: '#fff',
  borderRadius: '10px',
  padding: '20px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  transition: 'transform 0.15s ease, box-shadow 0.15s ease',

  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
  },
})

export const featureIconWrapStyle = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '44px',
  height: '44px',
  borderRadius: '10px',
  backgroundColor: 'rgba(11, 94, 46, 0.08)',
})

export const featureIconStyle = css({
  fontSize: '1.4rem',
  lineHeight: 1,
})

export const featureTitleStyle = css({
  fontSize: '0.98rem',
  fontWeight: 700,
  color: '#222',
  margin: 0,
})

export const featureDescStyle = css({
  fontSize: '0.85rem',
  color: '#666',
  lineHeight: 1.55,
  margin: 0,
})

// ------------------------------------------------------------------
// Section 2: Step-by-step tutorial
// ------------------------------------------------------------------

export const stepListStyle = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '48px',
})

// Two even columns that swap sides per step (handled by swapping the
// actual element order in widget.tsx, not just column widths) and wrap
// to a single stacked column once they can no longer fit side by side.
export const stepRowStyle = css({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '40px',
})

// A small "mock browser" card used as a stand-in for a real screenshot.
export const mockBrowserStyle = css({
  flex: '1 1 320px',
  minWidth: 0,
  borderRadius: '10px',
  overflow: 'hidden',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  backgroundColor: '#fff',
  border: '1px solid #e6e6e6',

  // Once stepRowStyle wraps to a single column, force the illustration
  // above the text on every step -- without this, alternating which
  // element comes first in the DOM (for the desktop side-swap) makes
  // the image land above the text on some steps and below on others
  // once stacked.
  '@media (max-width: 720px)': {
    order: 1,
  },
})

export const mockBrowserChromeStyle = css({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 10px',
  backgroundColor: '#f0f0f0',
  borderBottom: '1px solid #e2e2e2',
})

export const mockBrowserDotStyle = css({
  width: '8px',
  height: '8px',
  borderRadius: '50%',
})

export const mockBrowserContentStyle = css({
  aspectRatio: '16 / 10',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '20px 16px',
  textAlign: 'center',
  background: 'linear-gradient(180deg, #f7faf8 0%, #eef4ef 100%)',
})

export const mockBrowserIconStyle = css({
  fontSize: '1.8rem',
})

export const mockBrowserCaptionStyle = css({
  fontSize: '0.78rem',
  color: '#0b5e2e',
  fontWeight: 600,
  lineHeight: 1.4,
})

// A real screenshot standing in for the mock browser's content -- same box
// (mockBrowserContentStyle's aspect-ratio), just filled with an image
// instead of an icon/caption, and clickable to zoom.
export const mockBrowserImageStyle = css({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  cursor: 'zoom-in',
})

// A short screen recording, shown at its own natural aspect ratio (no
// browser-chrome frame, no fixed/cropped box -- a video's proportions vary
// too much to force into the same 16:10 box the screenshot mockup uses).
// Autoplaying/looping/muted with no controls, so it reads as a looping demo
// clip rather than a video player someone has to press play on.
export const videoCardStyle = css({
  flex: '1 1 320px',
  minWidth: 0,
  lineHeight: 0,
  borderRadius: '10px',
  overflow: 'hidden',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  cursor: 'zoom-in',

  // Same reasoning as mockBrowserStyle: keep media above text once the
  // step row wraps to a single column.
  '@media (max-width: 720px)': {
    order: 1,
  },
})

export const videoElementStyle = css({
  display: 'block',
  width: '100%',
  height: 'auto',
})

// Full-screen click-to-zoom overlay for a step's screenshot -- same pattern
// as gad-gallery/lcd-in-action's photo lightbox.
export const imageOverlayStyle = css({
  position: 'fixed',
  // Starts below the app's 40px sticky header instead of covering the
  // full viewport (inset: 0 would draw over the header), so the header
  // stays visible and the image below has an accurate amount of room.
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
  zIndex: 10000,
  cursor: 'zoom-out',

  '@keyframes guideOverlayFadeIn': {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  animation: 'guideOverlayFadeIn 0.2s ease',
})

export const imageOverlayImageStyle = css({
  maxWidth: '90vw',
  // Leaves room below the image for its caption -- the overlay's own box
  // is already only (100dvh - 40px) tall (see imageOverlayStyle above),
  // so this only needs to subtract the overlay's padding and caption height.
  maxHeight: 'calc(100dvh - 40px - 160px)',
  objectFit: 'contain',
  borderRadius: '8px',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
  cursor: 'default',

  '@keyframes guideOverlayZoomIn': {
    from: { transform: 'scale(0.85)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
  },
  animation: 'guideOverlayZoomIn 0.25s ease',
})

export const imageOverlayCaptionStyle = css({
  color: '#fff',
  textAlign: 'center',
  marginTop: '18px',
  fontSize: '1.05rem',
  fontWeight: 600,
  cursor: 'default',
})

export const stepContentStyle = css({
  flex: '1 1 320px',
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',

  '@media (max-width: 720px)': {
    order: 2,
  },
})

export const stepHeaderStyle = css({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
})

export const stepNumberBadgeStyle = css({
  flexShrink: 0,
  width: '30px',
  height: '30px',
  borderRadius: '50%',
  backgroundColor: '#0b5e2e',
  color: '#fff',
  fontSize: '0.9rem',
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

export const stepTitleStyle = css({
  fontSize: '1.05rem',
  fontWeight: 700,
  color: '#222',
  margin: 0,
})

export const stepDescStyle = css({
  fontSize: '0.92rem',
  color: '#555',
  lineHeight: 1.65,
  margin: 0,
})

export const noteBoxStyle = css({
  display: 'flex',
  gap: '10px',
  backgroundColor: '#fff8e1',
  border: '1px solid #ffe08a',
  borderRadius: '8px',
  padding: '14px 16px',
  fontSize: '0.88rem',
  color: '#6b5300',
  lineHeight: 1.6,
})
