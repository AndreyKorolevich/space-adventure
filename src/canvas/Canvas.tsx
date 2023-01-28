import React, { useEffect, useRef, useState } from 'react'
import styles from './Canvas.module.scss'
import preDraw from './predraw'
import postDraw from './postdraw'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import {
  FPS,
  FREQUENCY_APPEAR_BOMBS,
  FREQUENCY_APPEAR_BONUS,
  FREQUENCY_APPEAR_ENEMY,
  xCenter,
  yBottom
} from '../game/constants'
import { Player, PlayerInterface } from '../game/Player'
import { controllerCreator, ControllerType } from '../game/controller'
import { executeMoves } from '../game/palyerMovement'
import spaceship from '../img/spaceship.png'
import {
  addNewBomb, addNewBonus,
  addNewEnemies, addParticles,
  addProjectile,
  checkIntakeBonus,
  explodeBomb,
  moveBomb, removeParticles,
  removeProjectileOfScreen
} from '../game/operationWithObjects'
import { bckMusic, endGameSound } from '../utils/sounds'
import {
  actionsCanvas,
  fillBackgroundByParticles, machineGunModeShooting,
  setRefreshRate,
  sourceGame,
  SourceGameObjectType
} from '../actions/canvasAction'
import {
  BombInterface,
  BonusInterface,
  EnemyInterface,
  EnemyProjectileInterface,
  ParticleInterface,
  ProjectileInterface
} from '../reducers/canvasReducer'
import {
  drawBackground,
  drawBomb,
  drawBonusOnCanvas,
  drawCircleOnCanvas,
  drawParticles,
  drawRectangleOnCanvas
} from '../game/drawObjects'


export type CanvasType = HTMLCanvasElement | null

const Canvas: React.FC<unknown> = () => {
  const canvasRef = useRef<CanvasType>(null)
  const dispatch = useAppDispatch()
  const [workFrame, setWorkFrame] = useState(0)
  const gameNumber = useAppSelector(state => state.canvasReducer.gameNumber)
  const refreshRateMonitor = useAppSelector(state => state.canvasReducer.refreshRateMonitor)
  const isShowStartModal = useAppSelector(state => state.canvasReducer.isShowStartModal)


  useEffect(() => {
    dispatch(setRefreshRate())
  }, [])

  useEffect(() => {
    const newWorkFrame = Math.round(refreshRateMonitor / FPS)
    setWorkFrame(newWorkFrame)
  }, [refreshRateMonitor])


  useEffect(() => {
    const enemies: Array<Array<EnemyInterface>> = []
    const particles: Array<ParticleInterface> = []
    const backgroundParticles: Array<ParticleInterface> = []
    const projectiles: Array<ProjectileInterface> = []
    const enemyProjectiles: Array<EnemyProjectileInterface> = []
    const bombs: Array<BombInterface> = []
    const bonuses: Array<BonusInterface> = []
    let animationFrameId: number
    let refreshCount = 0
    // @ts-ignore
    window.settings = {
      enemies,
      particles,
      backgroundParticles,
      projectiles,
      enemyProjectiles,
      bombs,
      bonuses
    }

    fillBackgroundByParticles(backgroundParticles)
    bckMusic()

    canvasRef?.current?.focus()
    const canvas: CanvasType = canvasRef?.current
    const context = canvas?.getContext('2d') as CanvasRenderingContext2D

    const image = new Image()
    image.src = spaceship
    const player: PlayerInterface = new Player(xCenter, yBottom, image, context)

    const controller: ControllerType = controllerCreator(player)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (controller[event.code] && !player.isDead) {
        controller[event.code].pressed = true
      }
    }
    const handleKeyUp = (event: KeyboardEvent) => {
      if (controller[event.code] && !player.isDead) {
        controller[event.code].pressed = false

        if (event.code === 'KeyA' || event.code === 'KeyD') {
          player.rotation = 0
        }
        if (event.code === 'Space') {
          addProjectile(projectiles, player)
        }
      }
    }

    canvas?.addEventListener('keydown', handleKeyDown)
    canvas?.addEventListener('keyup', handleKeyUp)

    const render = () => {
      animationFrameId = window.requestAnimationFrame(render)
      const sourceGameObject: SourceGameObjectType = {
        enemies,
        particles,
        backgroundParticles,
        projectiles,
        enemyProjectiles,
        bonuses,
        bombs,
        player,
        controller,
        ctx: context,
        requestAnimationId: animationFrameId,
        refreshCanvas: refreshCount
      }

      if (!isShowStartModal) {
        preDraw(context, canvas)
        executeMoves(controller)
        machineGunModeShooting(projectiles, player, controller, refreshCount)
        drawBackground(context, backgroundParticles)
        //bombs section
        bombs.forEach((bomb, i) => {
          if (bomb.opacity <= 0) {
            setTimeout(() => bombs.splice(i, 1), 0)
          } else {
            drawBomb(context, bomb)
            moveBomb(bomb)
          }
        })

        //bonuses section
        bonuses.forEach((bonus, indexB) => {
          drawBonusOnCanvas(context, bonus)
          projectiles.forEach((projectile, indexP) => {
            checkIntakeBonus(bonuses, player, projectiles, controller, indexB, indexP)
          })
        })

       // projectiles section
        projectiles.forEach((projectile: ProjectileInterface, i: number) => {
          bombs.forEach(bomb => {
            // if projectile touches bomb, remove projectile
            if (Math.hypot(projectile.x - bomb.x, projectile.y - bomb.y) < projectile.radius + bomb.radius &&
              !bomb.active
            ) {
              explodeBomb(bomb)
              setTimeout(() => {
                projectiles.splice(i, 1)
              }, 0)
            }
          })

          drawCircleOnCanvas(context, projectile)
          projectile.x = projectile.x + projectile.velocity.x
          projectile.y = projectile.y + projectile.velocity.y
          removeProjectileOfScreen(projectiles, projectile, projectile.radius, i)
        })

        //particles section
        particles.forEach((particle, i) => {
          if (particle.opacity > 0) {
            drawParticles(context, particle)
          } else {
            removeParticles(particles, i)
          }
        })

        //player section
        if (!player.isDead) {
          player.update(particles)
        } else if (player.isDead && player.timeAfterDead > 0) {
          player.update(particles)
          player.timeAfterDead -= 1
        } else {
          cancelAnimationFrame(animationFrameId)
        }

        // enemy projectiles section
        enemyProjectiles.forEach((projectile: EnemyProjectileInterface, indexP) => {
          drawRectangleOnCanvas(context, projectile)
          projectile.y = projectile.y + projectile.velocity.y
          removeProjectileOfScreen(enemyProjectiles, projectile, projectile.height, indexP)

          if (projectile.y > player.y &&
            projectile.x + projectile.width >= player.x &&
            projectile.x <= player.x + player.width
          ) {
            endGameSound()
            dispatch(actionsCanvas.showFinalModalAC())
            addParticles(player, particles, 'white')
            setTimeout(() => enemyProjectiles.splice(indexP, 1), 0)
            player.width = 0
            player.height = 0
            player.isDead = true
          }

        })

        if (refreshCount % FREQUENCY_APPEAR_ENEMY === 0 || (refreshCount > 100 && enemies.length === 0)) {
          addNewEnemies(enemies)
        }

        if (refreshCount % FREQUENCY_APPEAR_BOMBS === 0 && bombs.length < 3) {
          addNewBomb(bombs)
        }

        if (refreshCount % FREQUENCY_APPEAR_BONUS === 0) {
          addNewBonus(bonuses)
        }
        dispatch(sourceGame(sourceGameObject))
        postDraw(context)
      }
      refreshCount++
    }
    render()
    return () => {
      window.cancelAnimationFrame(animationFrameId)
      canvas?.removeEventListener('keydown', handleKeyDown)
      canvas?.removeEventListener('keyup', handleKeyUp)
    }

  }, [gameNumber, workFrame, isShowStartModal])


  return (
    <>
      <canvas className={styles.canvas} ref={canvasRef} tabIndex={0} width={1024} height={576} />
    </>
  )
}

export default Canvas