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
export const moveUp = (player: PlayerInterface) => () => {
  // if (player.y > player.height* 2) {
  //   player.y = player.y - PLAYER_SPED
  // }
}
export const moveDown = (player: PlayerInterface) => () => {
  // if (player.y < window.innerHeight - player.height) {
  //   player.y = player.y + PLAYER_SPED
  // }
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

export const MachineGun = (player: PlayerInterface, projectiles: Array<ProjectileInterface>, ) => () => {
  if(player.machineGunMode){
    addProjectile(projectiles, player)
  }
}

