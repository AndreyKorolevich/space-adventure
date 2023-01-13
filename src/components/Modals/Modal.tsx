import React from 'react'
import styles from './Modal.module.scss'

type ModalType = {
  isShowModal: boolean,
  onClick: () => void,
  title: string,
  message: string,
  buttonText: string,
  score?: number
}

const Modal: React.FC<ModalType> = (props) => {
  const { isShowModal, onClick, title, message, score, buttonText } = props

  return (
    <dialog className={styles.dialog} open={isShowModal}>
      <header>
        <h3 className={styles.title}>{title}</h3>
      </header>
      <main>
        <div className={styles.message}>{message}
          {score && <span className={styles.score}>{score}</span>}
        </div>
      </main>
      <footer className={styles.footer}>
        <button onClick={onClick} className={styles.button}>{buttonText}</button>
      </footer>
    </dialog>
  )
}

export default Modal
