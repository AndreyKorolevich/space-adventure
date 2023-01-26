import shoot from '../media/shoot.wav'
import start from '../media/start.mp3'
import gameOver from '../media/gameOver.mp3'
import bonus from '../media/bonus.mp3'
import bcg from '../media/backgroundMusic.wav'
import explode from '../media/explode.wav'
import bomb from '../media/bomb.mp3'
import button from '../media/select.mp3'

export const shootSound = () => {
  new Audio(shoot).play()
}
export const startGameSound = () => {
  new Audio(start).play()
}
export const bckMusic = () => {
  new Audio(bcg).play()
}
export const endGameSound = () => {
  new Audio(gameOver).play()
}
export const enemyEliminatedSound = () => {
  new Audio(explode).play()
}
export const bombSound = () => {
  new Audio(bomb).play()
}
export const obtainPowerUpSound = () => {
  new Audio(bonus).play()
}
export const buttonSound = () => {
  new Audio(button).play()
}