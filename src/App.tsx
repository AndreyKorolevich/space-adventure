import React from 'react'
import './App.css'
import Canvas from './canvas/Canvas'
import { useAppSelector } from './app/hooks'
import FinalModal from './components/Modals/FinalModal/FinalModal'
import Points from './components/Points/Points'
import StartModal from './components/Modals/StartModal/StartModal'

const App: React.FC<unknown> = () => {
  const score = useAppSelector(state => state.canvasReducer.score)

  return (
    <>
      <div className={'score'}>{score}</div>
      <FinalModal />
      <StartModal />
      <Canvas />
      <Points />
    </>
  )
}

export default App
