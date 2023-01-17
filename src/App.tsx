import React from 'react'
import './App.css'
import Canvas from './canvas/Canvas'
import { useAppSelector } from './app/hooks'
import FinalModal from './components/Modals/FinalModal/FinalModal'
import Points from './components/Points/Points'
import StartModal from './components/Modals/StartModal/StartModal'

const App: React.FC<unknown> = () => {
  const score = useAppSelector(state => state.canvasReducer.score)
  const isShowStartModal = useAppSelector(state => state.canvasReducer.isShowStartModal)

  return (
    <div className={'App'}>
      {!isShowStartModal && <div className={'score'}>Score: {score}</div>}
      <FinalModal />
      <StartModal />
      <Canvas />
      <Points />
    </div>
  )
}

export default App
