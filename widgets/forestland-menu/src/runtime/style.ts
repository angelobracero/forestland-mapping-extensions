import {css} from "jimu-core";

export const sidebarStyle = css({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
})

export const navStyle = css({

  color: '#fff',
})

export const navListStyle = css({
  display: 'flex',
  listStyleType: 'none',
  padding: 0,
  gap: 0,
  textAlign: 'center',
})

export const navLinkStyle = css({
  padding: '10px',
  cursor: 'pointer',
  position: 'relative',
  backgroundColor: '#007f00',
  flex: 1,

  '&:hover': {
    color: '#fff',
    opacity: 0.8,
  }
})






