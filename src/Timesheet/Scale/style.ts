import { css } from '@emotion/css'
import { themeVar } from '../colors'

export const SCALE_CLASS = 'react-timesheet__scale'
export const SECTION_CLASS = 'react-timesheet__year'

export const wrapper = css`
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  width: 100%;
  height: 100%;
  pointer-events: none;
`

export const section = css`
  flex: 1 1 0;
  box-sizing: border-box;
  height: 100%;
  border-left: 1px dashed var(${themeVar('scale-line')});
  text-align: center;
  color: var(${themeVar('scale')});
  font-size: 13px;
  line-height: 24px;
  font-weight: 300;
`
