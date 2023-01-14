import {
  ParticleInterface,
  ProjectileInterface,
  EnemyInterface,
  BonusInterface,
  INCREASE_GAME_NUMBER,
  INCREASE_SCORE,
  SHOW_FINAL_MODAL,
  START_NEW_GAME,
  SET_REFRESH_RATE_MONITOR,
  ADD_POINT,
  HIDE_START_MODAL,
  UPDATE_POINT_POSITIONS,
  DELETE_POINT, UPDATE_COLOR_LAST_KILLED_ENEMY, EnemyProjectileInterface
} from '../reducers/canvasReducer'
import { ActionTypes, ThunkType } from '../app/store'
import {
  REWORD_FOR_KILLED_ENEMY,
  FREQUENCY_APPEAR_ENEMY,
  FREQUENCY_ENEMY_SHOT,
  FREQUENCY_GUN_SHOT
} from '../game/constants'
import refreshRate from 'refresh-rate'
import { PlayerInterface } from '../game/Player'
import {
  addNewEnemies,
  addParticles,
  addProjectile,
  deleteCollision, removeParticles, removeProjectileOfScreen
} from '../game/operationWithObjects'
import { ControllerType } from '../game/controller'
import { PointType } from '../components/Points/Point'
import { endGameSound, enemyEliminatedSound, enemyHitSound } from '../utils/sounds'
import {
  drawBackground,
  drawCircleOnCanvas,
  drawEnemies,
  drawParticles,
  drawRectangleOnCanvas
} from '../game/drawObjects'
import { Simulate } from 'react-dom/test-utils'
import play = Simulate.play

export type MousePositionType = {
  x: number
  y: number
}

export const actionsCanvas = {
  increaseScoreAC: (count: number) => ({
    type: INCREASE_SCORE,
    payload: {
      count
    }
  } as const),
  showFinalModalAC: () => ({
    type: SHOW_FINAL_MODAL
  } as const),
  hideStartModalAC: () => ({
    type: HIDE_START_MODAL
  } as const),
  startNewGameAC: () => ({
    type: START_NEW_GAME
  } as const),
  increaseGameNumberAC: () => ({
    type: INCREASE_GAME_NUMBER
  } as const),
  setRefreshRateMonitor: (refreshRateMonitor: number) => ({
    type: SET_REFRESH_RATE_MONITOR,
    payload: {
      refreshRateMonitor
    }
  } as const),
  addPointAC: (point: PointType) => ({
    type: ADD_POINT,
    payload: {
      point
    }
  } as const),
  deletePointAC: (id: string) => ({
    type: DELETE_POINT,
    payload: {
      id
    }
  } as const),
  updatePointPositionsAC: (id: string) => ({
    type: UPDATE_POINT_POSITIONS,
    payload: {
      id
    }
  } as const),
  updateColorLastKilledEnemyAC: (color: string) => ({
    type: UPDATE_COLOR_LAST_KILLED_ENEMY,
    payload: {
      color
    }
  } as const)
}

export type CanvasActionTypes = ActionTypes<typeof actionsCanvas>

export type SourceGameObjectType = {
  bonuses: Array<BonusInterface>
  enemies: Array<Array<EnemyInterface>>
  particles: Array<ParticleInterface>
  backgroundParticles: Array<ParticleInterface>
  projectiles: Array<ProjectileInterface>
  enemyProjectiles: Array<EnemyProjectileInterface>
  player: PlayerInterface,
  controller: ControllerType,
  ctx: CanvasRenderingContext2D,
  requestAnimationId: number,
  refreshCanvas: number
}

export const sourceGame = (
  sourceGameObject: SourceGameObjectType
): ThunkType<CanvasActionTypes> => async (dispatch, getState) => {
  const points = getState().canvasReducer.points
  const {
    ctx,
    player,
    projectiles,
    enemyProjectiles,
    enemies,
    particles,
    backgroundParticles,
    requestAnimationId,
    refreshCanvas
  } = sourceGameObject


  drawBackground(ctx, backgroundParticles)

  // projectiles section
  projectiles.forEach((projectile: ProjectileInterface, indexP: number) => {
    drawCircleOnCanvas(ctx, projectile)
    projectile.x = projectile.x + projectile.velocity.x
    projectile.y = projectile.y + projectile.velocity.y
    removeProjectileOfScreen(projectiles, projectile, projectile.radius, indexP)
  })

  // enemy projectiles section
  enemyProjectiles.forEach((projectile: EnemyProjectileInterface, indexP) => {
    drawRectangleOnCanvas(ctx, projectile)
    projectile.x = projectile.x + projectile.velocity.x
    projectile.y = projectile.y + projectile.velocity.y
    removeProjectileOfScreen(enemyProjectiles, projectile, projectile.height, indexP)

    if (projectile.y > player.y &&
      projectile.x + projectile.width >= player.x &&
      projectile.x <= player.x + player.width
    ) {
      endGameSound()
      dispatch(actionsCanvas.showFinalModalAC())
      addParticles(player, projectile, particles, 'white')
      enemyProjectiles.splice(indexP, 1)
      player.width = 0
      player.height = 0
      //cancelAnimationFrame(requestAnimationId)
    }

  })

  //points section
  points.forEach(point => {
    if (point.opacity > 0) {
      dispatch(actionsCanvas.updatePointPositionsAC(point.id))
    } else {
      dispatch(actionsCanvas.deletePointAC(point.id))
    }
  })

  //particles section
  particles.forEach((particle, i) => {
    if (particle.opacity > 0) {
      drawParticles(ctx, particle)
    } else {
      removeParticles(particles, i)
    }
  })

  // enemies section
  for (let i = 0; i < enemies.length; i++) {
    const enemiesBlock = enemies[i]
    enemiesBlock.forEach((enemy, indexEnemies: number) => {
      drawEnemies(ctx, enemy, enemiesBlock)
      dispatch(checkFinishGame(enemy, requestAnimationId, player))
      dispatch(managePlayerShot(projectiles, enemiesBlock, particles, enemy, indexEnemies))
    })

    if (enemiesBlock.length === 0) {
      setTimeout(() => {
        enemies.splice(i, 1)
      }, 0)
    }

    const randomEnemy = Math.round(Math.random() * (enemiesBlock.length - 1))
    if (refreshCanvas % FREQUENCY_ENEMY_SHOT === 0) {
      const projectile: EnemyProjectileInterface = {
        color: 'red',
        height: 15,
        width: 3,
        velocity: {
          x: 0,
          y: 2
        },
        x: enemiesBlock[randomEnemy]?.x,
        y: enemiesBlock[randomEnemy]?.y
      }
      enemyProjectiles.push(projectile)
    }
  }

  if (refreshCanvas % FREQUENCY_APPEAR_ENEMY === 0) {
    addNewEnemies(enemies)
  }
}

export const managePlayerShot = (
  projectiles: Array<ProjectileInterface>,
  enemyBlock: Array<EnemyInterface>,
  particles: Array<ParticleInterface>,
  enemy: EnemyInterface,
  indexEnemies: number
): ThunkType<CanvasActionTypes> => async (dispatch) => {

  projectiles.forEach((projectile, indexP) => {
    const distance = Math.hypot(enemy.x - projectile.x, enemy.y - projectile.y)
    if (distance < projectile.radius + enemy.width) {
      enemyEliminatedSound()
      deleteCollision(projectiles, enemyBlock, indexP, indexEnemies)
      dispatch(actionsCanvas.increaseScoreAC(REWORD_FOR_KILLED_ENEMY))
      addParticles(enemy, projectile, particles)

      const point: PointType = createPoints(enemy, projectile, REWORD_FOR_KILLED_ENEMY)
      dispatch(actionsCanvas.addPointAC(point))
    }
  })
}


export const checkFinishGame = (
  enemy: EnemyInterface,
  requestAnimationId: number,
  player: PlayerInterface
): ThunkType<CanvasActionTypes> => async (dispatch, getState) => {
  const distanceToPlayer = Math.hypot(enemy.x - player.x, enemy.y - player.y)
  if (distanceToPlayer < enemy.height) {
    dispatch(actionsCanvas.showFinalModalAC())
    endGameSound()
    cancelAnimationFrame(requestAnimationId)
  }
}

export const setRefreshRate = (): ThunkType<CanvasActionTypes> => async dispatch => {
  const refreshRateMonitor = await refreshRate()
  dispatch(actionsCanvas.setRefreshRateMonitor(refreshRateMonitor))
}

export const machineGunModeShooting = (
  projectiles: Array<ProjectileInterface>,
  player: PlayerInterface,
  controller: ControllerType,
  refreshCanvas: number
): ThunkType<CanvasActionTypes> => async (distance, getState) => {

  if (refreshCanvas % FREQUENCY_GUN_SHOT === 0 && controller['Mouse'].pressed) {
    addProjectile(projectiles, player)
  }
}

export const createPoints = (
  enemy: EnemyInterface,
  projectile: ProjectileInterface,
  count: number
) => {
  const angle = Math.atan2(enemy.y - projectile.y, enemy.x - projectile.x)

  const xCollision = Math.round(enemy.x - (enemy.width * Math.cos(angle)))
  const yCollision = Math.round(enemy.y - (enemy.height * Math.sin(angle)))

  return {
    left: xCollision,
    top: yCollision,
    count,
    opacity: 1,
    id: `${new Date().getTime() - Math.round(Math.random() * 1000)}`
  }
}

export const fillBackgroundByParticles = (backgroundParticles: Array<ParticleInterface>) => {
  const colors = ['white','#021F4B', '#4C3B71', '#115268']
  for (let i = 0; i < 100; i++) {
    const xCollision = Math.random() * document.body.clientWidth
    const yCollision = Math.random()  * window.innerHeight
    const color = colors[Math.floor(Math.random() * colors.length)]

      const particleRadius = Math.random() * 4
      const particleVelocity = {
        x: 0,
        y: 0.1
      }

      const newParticle: ParticleInterface = {
        x: xCollision,
        y: yCollision,
        radius: particleRadius,
        color,
        velocity: particleVelocity,
        gravity: 0.002,
        friction: 0.99,
        opacity: 1
      }
    backgroundParticles.push(newParticle)


  }
}

