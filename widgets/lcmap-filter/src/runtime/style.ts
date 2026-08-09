import {css} from "jimu-core";



export const filterContainerStyle = css({
  display: 'flex',
  flexDirection: 'column',
  paddingInline: '12px',
  rowGap: '10px',
})

export const titleStyle = css({
  paddingTop: '10px',
  fontSize: '16px',
})


export const regionFilterStyle = css({
  display: 'grid',
  gridTemplateColumns: '70px 1fr',
  placeItems: 'center',

})

export const provinceFilterStyle = css({
  display: 'grid',
  gridTemplateColumns: '70px 1fr',
  placeItems: 'center',
})