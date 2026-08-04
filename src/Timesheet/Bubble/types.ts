import { Bubble } from '../types'

/** Where a row's text goes, and how much room it gets. */
export interface Placement {
  /** Render the text to the left of the bubble instead of the right. */
  flipped: boolean
  /**
   * Cap on the text width, in pixels. Only set when the text fits on neither
   * side, in which case the label ellipsises.
   */
  maxWidth?: number
}

export interface Props {
  bubble: Bubble
  showDates?: boolean
  placement?: Placement
  onClick?: () => void
}
