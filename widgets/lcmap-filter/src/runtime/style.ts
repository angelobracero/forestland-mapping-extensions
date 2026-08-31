import { css } from "jimu-core";

export const filterPanelStyle = css({
  backgroundColor: '#fff',
  borderRadius: '10px',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.18)',
  overflow: 'hidden',
  minWidth: '240px',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
})

export const titleStyle = css({
  padding: '14px 16px 14px 14px',
  fontSize: '1.05rem',
  fontWeight: 400,
  color: '#222',
  textAlign: 'left',
  borderBottom: '1px solid #eee',
})

export const filterContainerStyle = css({
  display: 'flex',
  flexDirection: 'column',
  rowGap: '14px',
  padding: '16px',
})

export const fieldStyle = css({
  display: 'flex',
  flexDirection: 'column',
  rowGap: '6px',
})

export const fieldLabelStyle = css({
  fontSize: '0.85rem',
  fontWeight: 400,
  color: '#555',
})
