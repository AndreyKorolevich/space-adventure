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
  FREQUENCY_APPEAR_BONUS
} from '../game/constants'
import refreshRate from 'refresh-rate'
import { PlayerInterface } from '../game/Player'
import {
  addNewBomb, addNewBonus,
  addNewEnemies,
  addParticles,
  addProjectile, checkIntakeBonus,
  deleteCollision, explodeBomb, moveBomb, removeEmptyEnemyBlock, removeParticles, removeProjectileOfScreen
} from '../game/operationWithObjects'
import { ControllerType } from '../game/controller'
import { PointType } from '../components/Points/Point'
import nextId from "react-id-generator";
import { endGameSound, enemyEliminatedSound, enemyHitSound } from '../utils/sounds'
import {
  drawBackground, drawBomb, drawBonusOnCanvas,
  drawCircleOnCanvas,
  drawEnemies,
  drawParticles,
  drawRectangleOnCanvas
} from '../game/drawObjects'
import enemy from '../img/enemy.png'

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
    controller,
    projectiles,
    enemyProjectiles,
    enemies,
    bombs,
    bonuses,
    particles,
    backgroundParticles,
    requestAnimationId,
    refreshCanvas
  } = sourceGameObject

  drawBackground(ctx, backgroundParticles)

  //bombs section
  bombs.forEach((bomb, i) => {
    if (bomb.opacity <= 0) {
      bombs.splice(i, 1)
    } else {
      drawBomb(ctx, bomb)
      moveBomb(bomb)
    }
  })

   //bonuses section
  bonuses.forEach((bonus, indexB) => {
    drawBonusOnCanvas(ctx, bonus)
    projectiles.forEach((projectile, indexP) => {
      checkIntakeBonus(bonuses, player, projectiles, controller, indexB, indexP)
    })
  })

  // projectiles section
  projectiles.forEach((projectile: ProjectileInterface, i: number) => {
    bombs.forEach(bomb => {
      // if projectile touches bomb, remove projectile
      if (
        Math.hypot(
          projectile.x - bomb.x,
          projectile.y - bomb.y
        ) <
        projectile.radius + bomb.radius &&
        !bomb.active
      ) {
        projectiles.splice(i, 1)
        explodeBomb(bomb)
      }
    })

    drawCircleOnCanvas(ctx, projectile)
    projectile.x = projectile.x + projectile.velocity.x
    projectile.y = projectile.y + projectile.velocity.y
    removeProjectileOfScreen(projectiles, projectile, projectile.radius, i)
  })

  // enemy projectiles section
  enemyProjectiles.forEach((projectile: EnemyProjectileInterface, indexP) => {
    drawRectangleOnCanvas(ctx, projectile)
    projectile.y = projectile.y + projectile.velocity.y
    removeProjectileOfScreen(enemyProjectiles, projectile, projectile.height, indexP)

    if (projectile.y > player.y &&
      projectile.x + projectile.width >= player.x &&
      projectile.x <= player.x + player.width
    ) {
      endGameSound()
      dispatch(actionsCanvas.showFinalModalAC())
      addParticles(player, particles, 'white')
      enemyProjectiles.splice(indexP, 1)
      player.width = 0
      player.height = 0
      player.isDead = true
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
    enemiesBlock.forEach((enemy, enemyIndex: number) => {
      drawEnemies(ctx, enemy, enemiesBlock)
      dispatch(checkFinishGame(enemy, requestAnimationId, player))
      dispatch(managePlayerShot(projectiles, enemiesBlock, particles, enemy, enemyIndex))
      dispatch(checkBombTouchEnemy(bombs, enemiesBlock, particles, enemy, enemyIndex))
    })

    removeEmptyEnemyBlock(enemiesBlock, enemies, i)
    enemyShot(enemiesBlock, enemyProjectiles, refreshCanvas)
  }

  //player section
  if (!player.isDead) {
    player.update(particles)
  } else if (player.isDead && player.timeAfterDead > 0) {
    player.update(particles)
    player.timeAfterDead -= 1
  } else {
    cancelAnimationFrame(requestAnimationId)
  }

  if (refreshCanvas % FREQUENCY_APPEAR_ENEMY === 0 || enemies.length === 0) {
    addNewEnemies(enemies)
  }

  if (refreshCanvas % FREQUENCY_APPEAR_BOMBS === 0 && bombs.length < 3) {
    addNewBomb(bombs)
  }

   if (refreshCanvas % FREQUENCY_APPEAR_BONUS === 0) {
    addNewBonus(bonuses)
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
      dispatch(actionsCanvas.increaseScoreAC(BIG_REWORD_FOR_KILLED_ENEMY))
      addParticles(enemy, particles)

      const point: PointType = createPoints(enemy, projectile, BIG_REWORD_FOR_KILLED_ENEMY)
      dispatch(actionsCanvas.addPointAC(point))
    }
  })
}


export const checkFinishGame = (
  enemy: EnemyInterface,
  requestAnimationId: number,
  player: PlayerInterface
): ThunkType<CanvasActionTypes> => async (dispatch) => {
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
): ThunkType<CanvasActionTypes> => async () => {

  if (refreshCanvas % FREQUENCY_GUN_SHOT === 0 && controller['Mouse'].pressed) {
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
  const colors = ['white', '#021F4B', '#4C3B71', '#115268']
  for (let i = 0; i < 100; i++) {
    const xCollision = Math.random() * CANVAS_WIDTH
    const yCollision = Math.random() * CANVAS_HEIGHT
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
      enemiesBlock.splice(enemyIndex, 1)
      addParticles(enemy, particles)
      const point: PointType = createPoints(enemy, enemy, SMALL_REWORD_FOR_KILLED_ENEMY)
      dispatch(actionsCanvas.addPointAC(point))
    }
  })
}

const enemyShot = (
  enemiesBlock: Array<EnemyInterface>,
  enemyProjectiles: Array<EnemyProjectileInterface>,
  refreshCanvas: number
) => {
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
      x: enemiesBlock[randomEnemy].x,
      y: enemiesBlock[randomEnemy].y < 10 ? 10 : enemiesBlock[randomEnemy].y
    }
    enemyProjectiles.push(projectile)
  }
}

