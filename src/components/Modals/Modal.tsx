import React from 'react'
import styles from './Modal.module.scss'

type ModalType = {
  isShowModal: boolean,
  onClick: () => void,
  title: string,
  message?: string,
  buttonText: string,
  score?: number,
  children?: JSX.Element
}

const Modal: React.FC<ModalType> = (props) => {
  const { isShowModal, onClick, title, message, score, buttonText, children } = props

  return (
    <dialog className={styles.dialog} open={isShowModal}>
      <header className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
      </header>
      <main className={styles.main}>
        {children}
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
