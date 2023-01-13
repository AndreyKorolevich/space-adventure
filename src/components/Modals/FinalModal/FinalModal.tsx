import React from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { actionsCanvas } from '../../../actions/canvasAction'
import Modal from '../Modal'

const FinalModal: React.FC<unknown> = () => {
  const dispatch = useAppDispatch()
  const score = useAppSelector(state => state.canvasReducer.score)
  const isShowModal = useAppSelector(state => state.canvasReducer.isShowFinalModal)

  const startNewGame = () => {
    dispatch(actionsCanvas.startNewGameAC())
    dispatch(actionsCanvas.increaseGameNumberAC())
  }

  return (
    <>{isShowModal && <Modal isShowModal={isShowModal} onClick={startNewGame} title={'Game over'}
                             message={'Your score is: '} buttonText={'Start new game'} score={score} />
    }</>
  )
}

export default FinalModal
