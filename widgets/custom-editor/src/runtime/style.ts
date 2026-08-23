import { css } from "jimu-core";

export const containerStyle = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '48px',
  maxWidth: '960px',
  margin: '0 auto',
  padding: '56px 24px',
  boxSizing: 'border-box',
})

export const sectionStyle = css({
})

export const dividedSectionStyle = css({
  borderTop: '1px solid #e2e2e2',
  paddingTop: '48px',
})

export const titleStyle = css({
  fontSize: '2.25rem',
  fontWeight: 700,
  color: '#0b5e2e',
  lineHeight: 1.3,
  marginTop: 0,
  marginBottom: '1em',
  textAlign: 'center',

  '@media (max-width: 600px)': {
    fontSize: '1.6rem',
  },
})

export const paragraphStyle = css({
  fontSize: '1.05rem',
  lineHeight: 1.75,
  color: '#333',
  marginBottom: '1.25em',
  textAlign: 'left',
})
