import React from 'react'
import styles from './Point.module.scss'

export type PointType = {
  count: number,
  left: number,
  top: number,
  opacity: number,
  id: string
}

const Point: React.FC<PointType> = ({ count, left, top, opacity }) => {
  const style = {
    left,
    top,
    opacity
  }

  return (
    <span  className={styles.point} style={style}>{count}</span>
  )
}

export default Point