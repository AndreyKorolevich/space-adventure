import { PlayerInterface } from './Player'
import {  moveLeft, moveRight } from './palyerMovement'

export type ControllerType = {
  [property: string]: { pressed: boolean, func: () => void },
}

export const controllerCreator = (
  player: PlayerInterface,
): ControllerType => ({
  KeyA: { pressed: false, func: moveLeft(player) },
  KeyD: { pressed: false, func: moveRight(player) },
  Space: { pressed: false, func: () => {return} },
})