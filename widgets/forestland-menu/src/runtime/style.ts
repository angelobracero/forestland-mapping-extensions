import { css } from "jimu-core";

export const headerStyle = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  width: '100%',
  padding: '0 20px',
  background: 'linear-gradient(90deg, #0b5e2e 0%, #0d7a3a 100%)',
  borderBottom: '3px solid #ffcc00',
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
  boxSizing: 'border-box',
})

export const navStyle = css({
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
  overflowX: 'auto',
  scrollbarWidth: 'none',
  margin: 0,
  padding: 0,
})

export const navItemStyle = css({
  listStyleType: 'none',
})

export const navLinkStyle = css({
  background: 'none',
  border: 'none',
  font: 'inherit',
  display: 'inline-block',
  padding: '8px 14px',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '0.9rem',
  fontWeight: 500,
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  textDecoration: 'none',
  transition: 'background-color 0.2s ease',

  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    color: '#fff',
  },

  '&:focus-visible': {
    outline: '2px solid #ffcc00',
    outlineOffset: '2px',
  },
})
