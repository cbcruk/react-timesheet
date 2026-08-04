import { css } from '@emotion/css'
import { themeVar } from '../colors'

export const LIST_CLASS = 'react-timesheet__data'

export const wrapper = css`
  position: relative;
  overflow: hidden;
  margin: 0;
  padding: 28px 0 0 0;
  list-style: none;
  text-align: left;
  color: var(${themeVar('scale')});
  font-size: 13px;
`
