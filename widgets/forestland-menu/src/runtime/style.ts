import { css } from "jimu-core";

export const sidebarStyle = css({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
  background: '#fff',
  borderRight: '1px solid #e2e2e2',
  boxSizing: 'border-box',
  overflowY: 'auto',
})

export const logoContainerStyle = css({
  display: 'flex',
  justifyContent: 'center',
  padding: '28px 16px',
  borderBottom: '1px solid #eee',
})

export const logoImageStyle = css({
  width: '88px',
  height: '88px',
  objectFit: 'contain',
})

export const navStyle = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  margin: 0,
  padding: '16px 0',
})

export const navItemStyle = css({
  listStyleType: 'none',
})

export const navLinkStyle = css({
  background: 'none',
  border: 'none',
  font: 'inherit',
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: '12px 20px',
  color: '#333',
  fontSize: '0.92rem',
  fontWeight: 500,
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  textDecoration: 'none',

  '&:hover': {
    backgroundColor: '#0b5e2e',
    color: '#fff',
  },

  '&:focus-visible': {
    outline: '2px solid #0b5e2e',
    outlineOffset: '-2px',
  },
})
