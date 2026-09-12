import { css } from "jimu-core";

export const sidebarStyle = css({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
  // Same brand green used across the rest of the app (e.g. logoTitleStyle
  // before this, and the hover accent elsewhere) -- now the sidebar's own
  // background instead of just an accent on it.
  background: '#0b5e2e',
  boxSizing: 'border-box',
  overflowY: 'auto',
})

export const logoContainerStyle = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '10px',
  padding: '28px 16px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
})

export const logoButtonStyle = css({
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',

  '&:focus-visible': {
    outline: '2px solid #fff',
    outlineOffset: '2px',
  },
})

export const logoImageStyle = css({
  width: '120px',
  height: '120px',
  objectFit: 'contain',
})

export const logoTitleStyle = css({
  fontSize: '1.15rem',
  fontWeight: 700,
  color: '#fff',
  textAlign: 'center',
  lineHeight: 1.35,
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
  // flex (not block) so a leading icon and the label line up in a row --
  // harmless for the region/province buttons below that render just text,
  // since a single flex child lays out the same as a block one.
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  width: '100%',
  textAlign: 'left',
  padding: '12px 20px',
  color: '#fff',
  fontSize: '0.92rem',
  fontWeight: 500,
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  textDecoration: 'none',

  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },

  '&:focus-visible': {
    outline: '2px solid #fff',
    outlineOffset: '-2px',
  },
})

// The SVG's own path has a hardcoded fill="black" -- overriding fill here
// (a real CSS rule always beats an SVG presentation attribute) and using
// currentColor keeps the icon following whatever color the button text
// already is (white normally, still white on hover/active).
export const navIconStyle = css({
  width: '16px',
  height: '16px',
  flexShrink: 0,

  '& path': {
    fill: 'currentColor',
  },
})

export const navToggleStyle = css([
  navLinkStyle,
  {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },
])

// Groups a toggle button's icon+label together as one flex item, so
// justify-content: space-between (on navToggleStyle above) only pushes
// this group vs. the arrow apart -- not the icon away from its own label.
export const navToggleLabelGroupStyle = css({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
})

// Marks whichever nav item matches the page currently being viewed -- a
// stronger highlight than the hover state, plus a left accent bar so it
// reads at a glance even without hovering.
export const navLinkActiveStyle = css([
  navLinkStyle,
  {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    fontWeight: 700,
    borderLeft: '3px solid #fff',
    padding: '12px 20px 12px 17px',
  },
])

export const navToggleActiveStyle = css([
  navToggleStyle,
  {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    fontWeight: 700,
    borderLeft: '3px solid #fff',
    padding: '12px 20px 12px 17px',
  },
])

// A dark overlay tint (rather than a separate hex color) so it stays the
// same green just darker, and layers naturally if a region is expanded
// inside it too (see provinceListStyle below, which tints again on top).
export const regionListStyle = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  margin: 0,
  padding: '2px 0',
  backgroundColor: 'rgba(0, 0, 0, 0.12)',
})

export const regionLinkStyle = css([
  navLinkStyle,
  {
    padding: '10px 20px 10px 36px',
    fontSize: '0.88rem',
    fontWeight: 400,

    // A region with no LC Map published in any of its provinces yet (see
    // hasMap in widget.tsx) is rendered disabled, same as an individual
    // province with no map -- see provinceLinkStyle below.
    '&:disabled': {
      color: 'rgba(255, 255, 255, 0.45)',
      cursor: 'default',
    },

    '&:disabled:hover': {
      backgroundColor: 'transparent',
    },
  },
])

export const regionToggleStyle = css([
  regionLinkStyle,
  {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },
])

export const provinceListStyle = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  margin: 0,
  padding: '2px 0',
  // Stacks on top of regionListStyle's own tint, reading as one shade
  // darker still -- a small visual cue for "one level deeper".
  backgroundColor: 'rgba(0, 0, 0, 0.12)',
})

export const provinceLinkStyle = css([
  navLinkStyle,
  {
    padding: '8px 20px 8px 52px',
    fontSize: '0.85rem',
    fontWeight: 400,

    // A province with no LC Map published yet (see hasMap in widget.tsx) is
    // rendered disabled instead of navigating to an empty filter.
    '&:disabled': {
      color: 'rgba(255, 255, 255, 0.45)',
      cursor: 'default',
    },

    '&:disabled:hover': {
      backgroundColor: 'transparent',
    },
  },
])
