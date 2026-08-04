import { Bubble } from '../types'

export interface Props {
  bubbles: Bubble[]
  showDates?: boolean
  flipLabels?: boolean
  onBubbleClick?: (bubble: Bubble, index: number) => void
}
