import { css } from "jimu-core";

export const containerStyle = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '32px',
  maxWidth: '1100px',
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

export const gridStyle = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '24px',
})

export const cardStyle = css({
  backgroundColor: '#fff',
  borderRadius: '10px',
  overflow: 'hidden',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  cursor: 'pointer',

  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 6px 18px rgba(0, 0, 0, 0.15)',
  },

  '&:hover img': {
    transform: 'scale(1.05)',
  },
})

export const imageWrapperStyle = css({
  width: '100%',
  aspectRatio: '4 / 3',
  overflow: 'hidden',
})

export const imageStyle = css({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
  transition: 'transform 0.3s ease',
})

export const captionStyle = css({
  padding: '14px 16px',
})

export const captionTitleStyle = css({
  fontSize: '0.98rem',
  fontWeight: 600,
  color: '#222',
  margin: 0,
  lineHeight: 1.4,
})

export const captionDateStyle = css({
  fontSize: '0.82rem',
  color: '#888',
  marginTop: '4px',
})

export const overlayStyle = css({
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 24px',
  paddingBlockStart: 'calc(40px + 90px)',
  boxSizing: 'border-box',
  zIndex: 10000,
  cursor: 'zoom-out',

  '@keyframes gadOverlayFadeIn': {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  animation: 'gadOverlayFadeIn 0.2s ease',
})

export const overlayImageStyle = css({
  maxWidth: '90vw',
  maxHeight: '78vh',
  objectFit: 'contain',
  borderRadius: '8px',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
  cursor: 'default',

  '@keyframes gadOverlayZoomIn': {
    from: { transform: 'scale(0.85)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
  },
  animation: 'gadOverlayZoomIn 0.25s ease',
})

export const overlayCaptionStyle = css({
  color: '#fff',
  textAlign: 'center',
  marginTop: '18px',
  cursor: 'default',
})

export const overlayCaptionTitleStyle = css({
  fontSize: '1.1rem',
  fontWeight: 600,
  margin: 0,
})

export const overlayCaptionDateStyle = css({
  fontSize: '0.9rem',
  color: '#ccc',
  marginTop: '4px',
})

export const overlayCloseButtonStyle = css({
  position: 'fixed',
  top: '20px',
  right: '24px',
  width: '40px',
  height: '40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.6rem',
  lineHeight: 1,
  color: '#fff',
  background: 'rgba(255, 255, 255, 0.1)',
  border: 'none',
  borderRadius: '50%',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',

  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
})
