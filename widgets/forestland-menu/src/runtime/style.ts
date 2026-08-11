import {css} from "jimu-core";

export const sidebarStyle = css({
  height: '100%',
  width: '100%',
})

export const navStyle = css({
})

export const navListStyle = css({
  display: 'flex',
  listStyleType: 'none',
  padding: 0,
  gap: 0,
  textAlign: 'center',
})

export const navItemStyle = css({
  padding: '10px',
  cursor: 'pointer',
  position: 'relative',
  flex: 1,

  '&:hover': {
    backgroundColor: '#f0f0f0'
  }
})






