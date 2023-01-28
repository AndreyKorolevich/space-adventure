import { PlayerInterface } from './Player'
import { CANVAS_WIDTH, PLAYER_SPED } from './constants'
import { ControllerType } from './controller'
import { ProjectileInterface } from '../reducers/canvasReducer'
import { addProjectile } from './operationWithObjects'

export const executeMoves = (controller: ControllerType) => {
  Object.keys(controller).forEach(key => {
    if (controller[key].pressed) {
      controller[key].func()
    }
  })
}

export const moveRight = (player: PlayerInterface) => () => {
  if (player.x < CANVAS_WIDTH - player.height * 2) {
    player.x = player.x + PLAYER_SPED
    player.rotation = 0.15
  }
}
export const moveLeft = (player: PlayerInterface) => () => {
  if (player.x > 0) {
    player.x = player.x - PLAYER_SPED
    player.rotation = -0.15
  }
}

