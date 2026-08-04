import { Bubble } from '../types'

export interface Props {
  bubbles: Bubble[]
  showDates?: boolean
  onBubbleClick?: (bubble: Bubble, index: number) => void
}
