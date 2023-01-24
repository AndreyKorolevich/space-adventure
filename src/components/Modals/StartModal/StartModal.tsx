import React, { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { actionsCanvas } from '../../../actions/canvasAction'
import Modal from '../Modal'
import { startGameSound } from '../../../utils/sounds'
import controls from '../../../img/controls.png'

const StartModal: React.FC<unknown> = () => {
  const dispatch = useAppDispatch()
  const isShowStartModal = useAppSelector(state => state.canvasReducer.isShowStartModal)
  const [isShowSecondPhase, setSecondPhase] = useState(false)

  const startNewGame = () => {
    dispatch(actionsCanvas.hideStartModalAC())
    startGameSound()
  }

  const switchToSecondPhase = () => {
    setSecondPhase(true)
  }

  const title = isShowSecondPhase ? 'How to play' : 'Space adventure'
  const message = isShowSecondPhase ? undefined : 'Would you like to start game?'
  const buttonText = isShowSecondPhase ? 'Start game' : 'Start'

  return (
    <>
      {isShowStartModal && <Modal onClick={isShowSecondPhase ? startNewGame : switchToSecondPhase}
                                  title={title} message={message} buttonText={buttonText} isShowModal={isShowStartModal}
      >
        {isShowSecondPhase
          ? <img src={controls}/>
          : undefined}
      </Modal>
      }
    </>
  )
}

export default StartModal
