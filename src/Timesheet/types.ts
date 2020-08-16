export type Time = string[]

export interface Props {
  min: number
  max: number
  data: Time[]
}

export interface Bubble {
  start: string
  end: string
  label: string
  type: string
  width: number
  offset: number
}
