import { css } from '@emotion/css'
import { themeVar } from '../colors'

/**
 * Stable class names, so consumers can target the parts from their own CSS.
 *
 * They also keep the selectors below working: interpolating a generated emotion
 * class into a selector makes emotion inline that class's *styles* instead of
 * its name, which produces invalid CSS.
 */
export const ROW_CLASS = 'react-timesheet__row'
export const BUBBLE_CLASS = 'react-timesheet__bubble'
export const TEXT_CLASS = 'react-timesheet__text'
export const DATE_CLASS = 'react-timesheet__date'
export const LABEL_CLASS = 'react-timesheet__label'

export const date = css`
  flex: none;
  color: var(${themeVar('date')});
  font-size: 14px;
`

export const label = css`
  min-width: 0;
  padding-left: 5px;
  line-height: 21px;
  font-weight: 300;
  font-size: 14px;
  color: var(${themeVar('label')});
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

/**
 * Wraps the date and label so their combined width can be measured in one go,
 * so the pair can be mirrored as a unit when the row flips, and so a row with
 * nowhere to put its text can be capped — the label then ellipsises while the
 * date stays put.
 */
export const text = css`
  flex: none;
  display: inline-flex;
  align-items: center;
  min-width: 0;
  overflow: hidden;
`

/**
 * Space between a bubble and its text, in pixels. The measurement in `Bubbles`
 * has to account for it, so it lives here rather than inline in the rule.
 */
export const BUBBLE_GAP = 10

export const bubble = css`
  flex: none;
  position: relative;
  min-width: 4px;
  height: 7px;
  border-radius: 4px;
  margin-right: ${BUBBLE_GAP}px;
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

/**
 * Mirror of a row: the bubble sits at the right edge and its text runs leftward,
 * with the date still adjacent to the bubble. Used when the label would
 * otherwise be clipped off the right of the timesheet.
 */
export const flipped = css`
  flex-direction: row-reverse;

  & .${BUBBLE_CLASS} {
    margin-right: 0;
    margin-left: ${BUBBLE_GAP}px;
  }

  & .${TEXT_CLASS} {
    flex-direction: row-reverse;
  }

  & .${LABEL_CLASS} {
    padding-left: 0;
    padding-right: 5px;
  }
`

// The focus ring is left to the user agent: an explicit `:focus-visible` rule
// buys nothing here and jsdom's stylesheet parser chokes on the selector.
export const clickable = css`
  cursor: pointer;
`
