import { css } from '@emotion/css'
import { themeVar } from './colors'

/** Stable class name, so consumers can target the root from their own CSS. */
export const ROOT_CLASS = 'react-timesheet'

export const wrapper = css`
  position: relative;
  box-sizing: border-box;
  min-width: 320px;
  min-height: 292px;
  margin: 0 auto;
  padding-bottom: 12px;
  border-top: 1px solid var(${themeVar('border')});
  background-color: var(${themeVar('background')});
  font-family:
    'Signika Negative',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
`
