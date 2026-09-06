import { css } from "jimu-core";

// ------------------------------------------------------------------
// Hero
// ------------------------------------------------------------------

export const heroStyle = css({
  position: 'relative',
  minHeight: '440px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  overflow: 'hidden',
})

export const heroOverlayStyle = css({
  position: 'absolute',
  inset: 0,
  background:
    'linear-gradient(180deg, rgba(6, 46, 22, 0.75) 0%, rgba(6, 46, 22, 0.6) 55%, rgba(6, 46, 22, 0.82) 100%)',
})

export const heroContentStyle = css({
  position: 'relative',
  zIndex: 1,
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '48px 24px',
  textAlign: 'center',
  color: '#fff',
})

export const heroTitleStyle = css({
  fontSize: 'clamp(1.35rem, 1vw + 1.1rem, 2.3rem)',
  fontWeight: 800,
  lineHeight: 1.3,
  margin: 0,
  color: '#fff',
  textTransform: 'uppercase',
  letterSpacing: '0.02em',
  textShadow: '0 2px 16px rgba(0, 0, 0, 0.55), 0 1px 3px rgba(0, 0, 0, 0.8)',
})

export const heroTitleUnderlineStyle = css({
  width: '84px',
  height: '4px',
  borderRadius: '2px',
  backgroundColor: '#ffcc00',
  margin: '20px auto 0',
})

// ------------------------------------------------------------------
// Page container 
// ------------------------------------------------------------------

export const containerStyle = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '48px',
  maxWidth: '1000px',
  margin: '0 auto',
  padding: '48px 24px 64px',
  boxSizing: 'border-box',
})

// ------------------------------------------------------------------
// Content cards
// ------------------------------------------------------------------

export const contentCardStyle = css({
  backgroundColor: '#fff',
  padding: '40px',

  '@media (max-width: 600px)': {
    padding: '28px 20px',
  },
})

export const titleStyle = css({
  fontSize: '1.75rem',
  fontWeight: 700,
  color: '#0b5e2e',
  lineHeight: 1.3,
  marginTop: 0,
  marginBottom: '0.5em',
  textAlign: 'left',

  '@media (max-width: 600px)': {
    fontSize: '1.4rem',
  },
})

export const titleUnderlineStyle = css({
  width: '48px',
  height: '4px',
  borderRadius: '2px',
  backgroundColor: '#ffcc00',
  marginBottom: '28px',
})

export const leadParagraphStyle = css({
  fontSize: '1.15rem',
  fontWeight: 500,
  lineHeight: 1.75,
  color: '#222',
  marginBottom: '0.5em',
  textAlign: 'left',
})

export const paragraphStyle = css({
  fontSize: '1.05rem',
  lineHeight: 1.75,
  color: '#333',
  marginBottom: '1.25em',
  textAlign: 'left',
})

// ------------------------------------------------------------------
// Sub-sections within a content card
// ------------------------------------------------------------------

export const sectionStyle = css({
  marginTop: '32px',
  paddingTop: '32px',
  borderTop: '1px solid #eee',
})

// ------------------------------------------------------------------
// Mission statement banner
// ------------------------------------------------------------------

export const missionCardStyle = css({
  background: 'linear-gradient(135deg, #0b5e2e 0%, #0d7a3a 100%)',
  padding: '48px 40px',
  textAlign: 'center',

  '@media (max-width: 600px)': {
    padding: '32px 24px',
  },
})

export const missionTitleStyle = css({
  fontSize: '1.6rem',
  fontWeight: 700,
  color: '#fff',
  lineHeight: 1.3,
  marginTop: 0,
  marginBottom: '0.75em',
})

export const missionParagraphStyle = css({
  fontSize: '1.05rem',
  lineHeight: 1.75,
  color: 'rgba(255, 255, 255, 0.92)',
  maxWidth: '720px',
  margin: '0 auto',
})
