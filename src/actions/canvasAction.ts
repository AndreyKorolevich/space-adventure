import {
  ParticleInterface,
  ProjectileInterface,
  EnemyInterface,
  BonusInterface,
  EnemyProjectileInterface,
  BombInterface,
  INCREASE_GAME_NUMBER,
  INCREASE_SCORE,
  SHOW_FINAL_MODAL,
  START_NEW_GAME,
  SET_REFRESH_RATE_MONITOR,
  ADD_POINT,
  HIDE_START_MODAL,
  UPDATE_POINT_POSITIONS,
  DELETE_POINT
} from '../reducers/canvasReducer'
import { ActionTypes, ThunkType } from '../app/store'
import {
  BIG_REWORD_FOR_KILLED_ENEMY,
  FREQUENCY_APPEAR_ENEMY,
  FREQUENCY_ENEMY_SHOT,
  FREQUENCY_GUN_SHOT,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  FREQUENCY_APPEAR_BOMBS,
  SMALL_REWORD_FOR_KILLED_ENEMY,
  ENEMY_RADIUS,
  FREQUENCY_APPEAR_BONUS, STAR_COLORS
} from '../game/constants'
import refreshRate from 'refresh-rate'
import { PlayerInterface } from '../game/Player'
import {
  addNewBomb, addNewBonus,
  addNewEnemies,
  addParticles,
  addProjectile,
  checkIntakeBonus,
  deleteCollision,
  explodeBomb,
  moveBomb,
  removeEmptyEnemyBlock,
  removeParticles,
  removeProjectileOfScreen
} from '../game/operationWithObjects'
import { ControllerType } from '../game/controller'
import { PointType } from '../components/Points/Point'
import nextId from 'react-id-generator'
import { endGameSound, enemyEliminatedSound, enemyShootSound } from '../utils/sounds'
import {
  drawBackground, drawBomb, drawBonusOnCanvas,
  drawCircleOnCanvas,
  drawEnemies,
  drawParticles,
  drawRectangleOnCanvas
} from '../game/drawObjects'


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
  } as const)
}

export type CanvasActionTypes = ActionTypes<typeof actionsCanvas>

export type SourceGameObjectType = {
  bonuses: Array<BonusInterface>
  enemies: Array<Array<EnemyInterface>>
  particles: Array<ParticleInterface>
  backgroundParticles: Array<ParticleInterface>
  projectiles: Array<ProjectileInterface>
  bombs: Array<BombInterface>
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
    bombs,
    particles,
    requestAnimationId,
    refreshCanvas
  } = sourceGameObject


  //points section
  points.forEach(point => {
    if (point.opacity > 0) {
      dispatch(actionsCanvas.updatePointPositionsAC(point.id))
    } else {
      dispatch(actionsCanvas.deletePointAC(point.id))
    }
  })



  // enemies section
  for (let i = 0; i < enemies.length; i++) {
    const enemiesBlock = enemies[i]
    for (let j = 0; j < enemiesBlock.length; j++) {
      const enemy = enemiesBlock[j]
      drawEnemies(ctx, enemy, enemiesBlock)
      if (Math.hypot(enemy.x - player.x, enemy.y - player.y) < enemy.height) {
        dispatch(actionsCanvas.showFinalModalAC())
        endGameSound()
        cancelAnimationFrame(requestAnimationId)
        break
      }

      for (let k = 0; k < projectiles.length; k++) {
        const projectile = projectiles[k]
        const distance = Math.hypot(enemy.x - projectile.x, enemy.y - projectile.y)
        if (distance < projectile.radius + enemy.width) {
          enemyEliminatedSound()
          deleteCollision(projectiles, enemiesBlock, k, j)
          addParticles(enemy, particles)
          dispatch(actionsCanvas.increaseScoreAC(BIG_REWORD_FOR_KILLED_ENEMY))
          dispatch(actionsCanvas.addPointAC(createPoints(enemy, projectile, BIG_REWORD_FOR_KILLED_ENEMY)))
          break
        }
      }


      for (let k = 0; k < bombs.length; k++) {
        // if bomb touches enemy, remove enemy
        const bomb = bombs[k]
        if (Math.hypot(enemy.x - bomb.x, enemy.y - bomb.y) < ENEMY_RADIUS + bomb.radius && bomb.active) {
          addParticles(enemy, particles)
          dispatch(actionsCanvas.increaseScoreAC(SMALL_REWORD_FOR_KILLED_ENEMY))
          dispatch(actionsCanvas.addPointAC(createPoints(enemy, enemy, SMALL_REWORD_FOR_KILLED_ENEMY)))
          setTimeout(() => {
            enemiesBlock.splice(j, 1)
          }, 0)
          break
        }
      }
    }
    removeEmptyEnemyBlock(enemiesBlock, enemies, i)
    enemyShot(enemiesBlock, enemyProjectiles, refreshCanvas)
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
) => {
  if (refreshCanvas % FREQUENCY_GUN_SHOT === 0 && controller['Space'].pressed && player.machineGunMode) {
    addProjectile(projectiles, player)
  }
}

export const createPoints = (
  enemy: EnemyInterface,
  projectile: ProjectileInterface | EnemyInterface,
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
    id: nextId()
  }
}

export const fillBackgroundByParticles = (backgroundParticles: Array<ParticleInterface>) => {
  for (let i = 0; i < 100; i++) {
    const xCollision = Math.random() * CANVAS_WIDTH
    const yCollision = Math.random() * CANVAS_HEIGHT
    const color = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)]

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

export const checkBombTouchEnemy = (
  bombs: Array<BombInterface>,
  enemiesBlock: Array<EnemyInterface>,
  particles: Array<ParticleInterface>,
  enemy: EnemyInterface,
  enemyIndex: number
): ThunkType<CanvasActionTypes> => async (dispatch) => {
  bombs.forEach(bomb => {
    // if bomb touches enemy, remove enemy
    if (Math.hypot(enemy.x - bomb.x, enemy.y - bomb.y) < ENEMY_RADIUS + bomb.radius && bomb.active) {
      dispatch(actionsCanvas.increaseScoreAC(SMALL_REWORD_FOR_KILLED_ENEMY))
      addParticles(enemy, particles)
      const point: PointType = createPoints(enemy, enemy, SMALL_REWORD_FOR_KILLED_ENEMY)
      dispatch(actionsCanvas.addPointAC(point))

      setTimeout(() => {
        enemiesBlock.splice(enemyIndex, 1)
      }, 0)
    }
  })
}

const enemyShot = (
  enemiesBlock: Array<EnemyInterface>,
  enemyProjectiles: Array<EnemyProjectileInterface>,
  refreshCanvas: number
) => {
  if (refreshCanvas % FREQUENCY_ENEMY_SHOT === 0) {
    enemyShootSound()
    const randomEnemyIndex = Math.round(Math.random() * (enemiesBlock.length - 1))
    const randomEnemy = enemiesBlock[randomEnemyIndex]


    const projectile: EnemyProjectileInterface = {
      color: 'red',
      height: 15,
      width: 3,
      velocity: {
        x: 0,
        y: 2
      },
      x: randomEnemy.x + (randomEnemy.width / 2),
      y: randomEnemy.y + (randomEnemy.height / 2)
    }

    enemyProjectiles.push(projectile)
  }
}

