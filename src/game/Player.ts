import { PLAYER_SCALE } from './constants'
import { ParticleInterface } from '../reducers/canvasReducer'

export interface PlayerInterface {
  x: number
  y: number
  width: number
  height: number
  rotation: number
  image: HTMLImageElement
  ctx: CanvasRenderingContext2D
  draw: () => void
  update: (particles: Array<ParticleInterface>) => void
  machineGunMode: boolean
  isDead: boolean,
  timeAfterDead: number
}

export class Player {
  x: number
  y: number
  width: number
  height: number
  rotation: number
  ctx: CanvasRenderingContext2D
  machineGunMode: boolean
  image: HTMLImageElement
  isDead: boolean
  timeAfterDead: number
  frames: number

  constructor(x: number, y: number, image: HTMLImageElement, ctx: CanvasRenderingContext2D) {
    this.ctx = ctx
    this.machineGunMode = false
    this.image = image
    this.width = image.width * PLAYER_SCALE
    this.height = image.height * PLAYER_SCALE
    this.x = x
    this.y = y - this.height * 2
    this.rotation = 0
    this.isDead = false
    this.timeAfterDead = 300
    this.frames = 0
  }

  draw() {
    if (this.ctx && this.image) {
      this.ctx.save()
      this.ctx.translate(this.x + this.width / 2, this.y + this.height + 2)
      this.ctx.rotate(this.rotation)
      this.ctx.translate(-this.x - this.width / 2, -this.y - this.height / 2)
      this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
      this.ctx.restore()
    }
  }

  update(particles: Array<ParticleInterface>) {
    this.draw()

    this.frames++
    if (this.frames % 2 === 0 && !this.isDead) {
      particles.push(
        {
          x: this.x + this.width / 2,
          y: this.y + this.height * 1.3,
          velocity: {
            x: (Math.random() - 0.5) * 1.5,
            y: 1.4
          },
          radius: Math.random() * 2,
          color: 'white',
          opacity: 1,
          gravity: 0.001,
          friction: 0.97,
        }
      )
    }
  }
}
