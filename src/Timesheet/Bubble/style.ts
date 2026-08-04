import { css } from '@emotion/css'
import { themeVar } from '../colors'

/**
 * Stable class names, so consumers can target the parts from their own CSS.
 *
 * They also keep the `:hover` rule below working: interpolating a generated
 * emotion class into a selector makes emotion inline that class's *styles*
 * instead of its name, which produces invalid CSS.
 */
export const ROW_CLASS = 'react-timesheet__row'
export const BUBBLE_CLASS = 'react-timesheet__bubble'
export const DATE_CLASS = 'react-timesheet__date'
export const LABEL_CLASS = 'react-timesheet__label'

export const date = css`
  color: var(${themeVar('date')});
  font-size: 14px;
`

export const label = css`
  padding-left: 5px;
  line-height: 21px;
  font-weight: 300;
  font-size: 14px;
  color: var(${themeVar('label')});
  white-space: nowrap;
`

export const bubble = css`
  flex: none;
  position: relative;
  min-width: 4px;
  height: 7px;
  border-radius: 4px;
  margin-right: 10px;
  opacity: 0.7;
  transition: opacity 0.15s ease-in-out;
`

export const wrapper = css`
  position: relative;
  display: flex;
  height: 21px;
  margin: 0 0 3px 0;
  line-height: 22px;
  align-items: center;
  white-space: nowrap;

  &:hover .${BUBBLE_CLASS} {
    opacity: 1;
  }
`

// The focus ring is left to the user agent: an explicit `:focus-visible` rule
// buys nothing here and jsdom's stylesheet parser chokes on the selector.
export const clickable = css`
  cursor: pointer;
`
