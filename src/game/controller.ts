import { PlayerInterface } from './Player'
import { moveDown, moveLeft, moveRight, moveUp, MachineGun } from './palyerMovement'
import { ProjectileInterface } from '../reducers/canvasReducer'

export type ControllerType = {
  [property: string]: { pressed: boolean, func: () => void },
}

export const controllerCreator = (player: PlayerInterface, projectiles: Array<ProjectileInterface>): ControllerType => ({
  KeyA: { pressed: false, func: moveLeft(player) },
  KeyD: { pressed: false, func: moveRight(player) },
  Space: { pressed: false, func: MachineGun(player, projectiles) },
})