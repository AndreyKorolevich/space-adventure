import React from 'react'
import Point from './Point'
import { useAppSelector } from '../../app/hooks'


const Points: React.FC<unknown> = () => {
  const points = useAppSelector(state => state.canvasReducer.points)
  return (
    <>
      {points.map(point => {
      return <Point count={point.count} left={point.left} top={point.top} key={point.id} id={point.id} opacity={point.opacity} />
    })}
    </>)
}

export default Points