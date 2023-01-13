import React from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { actionsCanvas } from '../../../actions/canvasAction'
import Modal from '../Modal'
import { startGameSound } from '../../../utils/sounds'

const StartModal: React.FC<unknown> = () => {
  const dispatch = useAppDispatch()
  const isShowStartModal = useAppSelector(state => state.canvasReducer.isShowStartModal)

  const startNewGame = () => {
    dispatch(actionsCanvas.hideStartModalAC())
    startGameSound()
  }

  return (
    <>{isShowStartModal && <Modal isShowModal={isShowStartModal} onClick={startNewGame} title={'Canvas game'}
                             message={'Would you like to start game?'} buttonText={'Start game'}  />
    }</>
  )
}

export default StartModal
