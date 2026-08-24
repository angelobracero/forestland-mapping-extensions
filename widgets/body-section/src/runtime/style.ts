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
// Stats strip
// ------------------------------------------------------------------

export const statsRowStyle = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '20px',
})

export const statCardStyle = css({
  flex: '1 1 200px',
  backgroundColor: '#fff',
  borderRadius: '10px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
  padding: '24px 20px',
  textAlign: 'center',
})

export const statNumberStyle = css({
  fontSize: '1.8rem',
  fontWeight: 700,
  color: '#0b5e2e',
  lineHeight: 1.2,
})

export const statLabelStyle = css({
  fontSize: '0.85rem',
  color: '#666',
  marginTop: '6px',
  lineHeight: 1.5,
})

// ------------------------------------------------------------------
// Content cards
// ------------------------------------------------------------------

export const contentCardStyle = css({
  backgroundColor: '#fff',
  borderRadius: '10px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
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
  marginBottom: '1em',
  textAlign: 'left',

  '@media (max-width: 600px)': {
    fontSize: '1.4rem',
  },
})

export const paragraphStyle = css({
  fontSize: '1.05rem',
  lineHeight: 1.75,
  color: '#333',
  marginBottom: '1.25em',
  textAlign: 'left',
})

// ------------------------------------------------------------------
// Quick links
// ------------------------------------------------------------------

export const quickLinksHeaderStyle = css({
  textAlign: 'center',
})

export const quickLinksTitleStyle = css({
  fontSize: '1.5rem',
  fontWeight: 700,
  color: '#0b5e2e',
  margin: 0,
})

export const quickLinksSubtitleStyle = css({
  fontSize: '0.95rem',
  color: '#666',
  marginTop: '8px',
})

export const quickLinksGridStyle = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: '16px',
  marginTop: '24px',
})

export const quickLinkCardStyle = css({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  backgroundColor: '#fff',
  borderRadius: '10px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
  padding: '18px 20px',
  cursor: 'pointer',
  transition: 'transform 0.15s ease, box-shadow 0.15s ease',

  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.14)',
  },
})

export const quickLinkIconStyle = css({
  fontSize: '1.4rem',
  flexShrink: 0,
})

export const quickLinkLabelStyle = css({
  fontSize: '0.92rem',
  fontWeight: 600,
  color: '#222',
  flex: 1,
})

export const quickLinkArrowStyle = css({
  color: '#0b5e2e',
  fontWeight: 700,
})
