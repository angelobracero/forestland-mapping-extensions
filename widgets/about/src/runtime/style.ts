import { css } from "jimu-core";

export const containerStyle = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '40px',
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

export const videoGridStyle = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: '32px',
})

export const videoCardStyle = css({
  backgroundColor: '#fff',
  borderRadius: '10px',
  overflow: 'hidden',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
})

// TODO: this is a placeholder in place of a real embedded video (e.g. a
// built-in Embed widget or an <iframe> pointed at the actual AVP). Swap
// this thumbnail for the real video once the AVP files/links are ready.
export const videoThumbStyle = css({
  position: 'relative',
  aspectRatio: '16 / 9',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  background: 'linear-gradient(135deg, #0b5e2e 0%, #0d7a3a 100%)',
})

export const playButtonStyle = css({
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  backgroundColor: 'rgba(255, 255, 255, 0.92)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.4rem',
  color: '#0b5e2e',
  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
})

export const videoPlaceholderLabelStyle = css({
  fontSize: '0.78rem',
  fontWeight: 600,
  color: 'rgba(255, 255, 255, 0.85)',
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
  borderRadius: '999px',
  padding: '3px 12px',
})

export const videoInfoStyle = css({
  padding: '18px 20px',
})

export const videoTitleStyle = css({
  fontSize: '1.1rem',
  fontWeight: 700,
  color: '#222',
  margin: 0,
})

export const videoDescStyle = css({
  fontSize: '0.9rem',
  color: '#666',
  lineHeight: 1.6,
  marginTop: '8px',
})
