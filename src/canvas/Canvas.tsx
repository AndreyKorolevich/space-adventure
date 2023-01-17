import React, { useEffect, useRef, useState } from 'react'
import styles from './Canvas.module.scss'
import preDraw from './predraw'
import postDraw from './postdraw'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import {
  fillBackgroundByParticles,
  setRefreshRate,
  sourceGame,
  SourceGameObjectType
} from '../actions/canvasAction'
import { FPS, xCenter, yBottom, yCenter } from '../game/constants'
import { Player, PlayerInterface } from '../game/Player'
import { controllerCreator, ControllerType } from '../game/controller'
import { executeMoves } from '../game/palyerMovement'
import spaceship from '../img/spaceship.png'
import {
  BombInterface,
  BonusInterface,
  EnemyInterface,
  EnemyProjectileInterface,
  ParticleInterface,
  ProjectileInterface
} from '../reducers/canvasReducer'
import { addProjectile } from '../game/operationWithObjects'

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
// @ts-ignore
    window.bombs = bombs
    fillBackgroundByParticles(backgroundParticles)

    const canvas: CanvasType = canvasRef?.current
    const context = canvas?.getContext('2d') as CanvasRenderingContext2D

    const image = new Image()
    image.src = spaceship
    const player: PlayerInterface = new Player(xCenter, yBottom, image, context)

    const controller: ControllerType = controllerCreator(player, projectiles)

    let animationFrameId: number
    let refreshCount = 0

    const handleKeyDown = (event: KeyboardEvent) => {
      if (controller[event.code] && !player.isDead) {
        controller[event.code].pressed = true
      }
    }
    const handleKeyUp = (event: KeyboardEvent) => {
      if (controller[event.code] && !player.isDead) {
        controller[event.code].pressed = false

        if(event.code === 'KeyA' || event.code === 'KeyD'){
          player.rotation = 0
        }
        if(event.code === 'Space'){
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
      <canvas className={styles.canvas} ref={canvasRef} tabIndex={0} />
    </>
  )
}

export default Canvas