import { css } from "jimu-core";

export const containerStyle = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '32px',
  maxWidth: '860px',
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

export const filterBarStyle = css({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-end',
  gap: '16px',
})

export const filterFieldStyle = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  minWidth: '180px',
})

export const searchFieldStyle = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  flex: '1 1 240px',
})

export const filterLabelStyle = css({
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#555',
})

export const filterFooterStyle = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontSize: '0.85rem',
  color: '#888',
})

export const clearFiltersButtonStyle = css({
  background: 'none',
  border: 'none',
  padding: 0,
  color: '#0b5e2e',
  fontWeight: 600,
  fontSize: '0.85rem',
  cursor: 'pointer',
  textDecoration: 'underline',
})

export const groupListStyle = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
})

export const groupCardStyle = css({
  backgroundColor: '#fff',
  borderRadius: '10px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
  overflow: 'hidden',
})

export const groupHeaderStyle = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '18px 20px',
  cursor: 'pointer',
  userSelect: 'none',

  '&:hover': {
    backgroundColor: '#f7f9f7',
  },
})

export const groupHeaderLeftStyle = css({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
})

export const groupTitleStyle = css({
  fontSize: '1.1rem',
  fontWeight: 700,
  color: '#0b5e2e',
  margin: 0,
})

export const groupCountBadgeStyle = css({
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#0b5e2e',
  backgroundColor: '#e6f3ea',
  borderRadius: '999px',
  padding: '3px 10px',
})

export const chevronStyle = css({
  fontSize: '0.85rem',
  color: '#888',
  transition: 'transform 0.2s ease',
})

export const chevronOpenStyle = css({
  transform: 'rotate(180deg)',
})

export const commentListStyle = css({
  display: 'flex',
  flexDirection: 'column',
  borderTop: '1px solid #eee',
})

export const commentItemStyle = css({
  padding: '16px 20px',

  '&:not(:last-of-type)': {
    borderBottom: '1px solid #f0f0f0',
  },
})

export const commentTextStyle = css({
  fontSize: '0.95rem',
  color: '#222',
  lineHeight: 1.6,
  margin: 0,
})

export const commentMetaStyle = css({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '6px',
  marginTop: '10px',
  fontSize: '0.8rem',
  color: '#888',
})

export const commentMetaDotStyle = css({
  color: '#ccc',
})

export const attachmentBadgeStyle = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '0.78rem',
  color: '#0b5e2e',
  backgroundColor: '#e6f3ea',
  borderRadius: '999px',
  padding: '2px 8px',
})

export const emptyStateStyle = css({
  textAlign: 'center',
  color: '#888',
  padding: '32px 0',
})
