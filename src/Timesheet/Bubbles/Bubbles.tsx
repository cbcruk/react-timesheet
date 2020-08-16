import React from 'react'
import Bubble from '../Bubble'
import { Props } from './types'
import * as styles from './style'

function Bubbles({ bubbles }: Props) {
  return (
    <div className={styles.wrapper}>
      {bubbles.map((bubble, index) => (
        <Bubble key={index} {...bubble} />
      ))}
    </div>
  )
}

export default Bubbles
