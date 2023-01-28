import shoot from '../media/shoot.wav'
import start from '../media/start.mp3'
import gameOver from '../media/gameOver.mp3'
import bonus from '../media/bonus.mp3'
import bcg from '../media/backgroundMusic.wav'
import explode from '../media/explode.wav'
import bomb from '../media/bomb.mp3'
import button from '../media/select.mp3'
import enemyShoot from '../media/enemyShoot.wav'

export const shootSound = () => {
  const a = new Audio(shoot)
  a.volume = 0.1
  a.play()
}
export const enemyShootSound = () => {
  const a = new Audio(enemyShoot)
  a.volume = 0.2
  a.play()
}
export const startGameSound = () => {
  const a = new Audio(start)
  a.volume = 0.2
  a.play()
}
export const bckMusic = () => {
  const a = new Audio(bcg)
  a.volume = 0.1
  a.play()
}
export const endGameSound = () => {
  const a = new Audio(gameOver)
  a.volume = 0.2
  a.play()
}
export const enemyEliminatedSound = () => {
  const a = new Audio(explode)
  a.volume = 0.3
  a.play()
}
export const bombSound = () => {
  const a = new Audio(bomb)
  a.volume = 0.4
  a.play()
}
export const obtainPowerUpSound = () => {
  const a = new Audio(bonus)
  a.volume = 0.1
  a.play()
}
export const buttonSound = () => {
  const a = new Audio(button)
  a.volume = 0.3
  a.play()
}
