import React from 'react'
import Point from './Point'
import { useAppSelector } from '../../app/hooks'
import ReactDOM from 'react-dom'

const container = document.getElementById('points')!

const Points: React.FC<unknown> = () => {
  const points = useAppSelector(state => state.canvasReducer.points)
  return ReactDOM.createPortal(
    <div>
      {points.map(point => {
      return <Point count={point.count} left={point.left} top={point.top} key={point.id} id={point.id} opacity={point.opacity} />
    })}
    </div>, container)
}

export default Points