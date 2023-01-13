import { PLAYER_SCALE } from './constants'

export interface PlayerInterface {
  x: number
  y: number
  width: number
  height: number
  rotation: number
  image: HTMLImageElement
  ctx: CanvasRenderingContext2D
  draw: () => void
  update: () => void
  machineGunMode: boolean
}

export class Player  {
  x: number
  y: number
  width: number
  height: number
  rotation: number
  ctx: CanvasRenderingContext2D
  machineGunMode: boolean
  image: HTMLImageElement
  constructor(x: number, y: number, image: HTMLImageElement, ctx: CanvasRenderingContext2D) {
    this.ctx = ctx
    this.machineGunMode = false
    this.image = image
    this.width = image.width * PLAYER_SCALE
    this.height = image.height * PLAYER_SCALE
    this.x = x
    this.y = y - this.height * 2
    this.rotation = 0
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

  update() {
    this.draw()
  }
}
