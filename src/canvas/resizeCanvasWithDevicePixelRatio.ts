import { CanvasType } from './Canvas'
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../game/constants'


const resizeCanvasWithDevicePixelRatio = (canvas: CanvasType) => {
  if (canvas) {
      const width = CANVAS_WIDTH
      const height = CANVAS_HEIGHT


    if (canvas.width !== width || canvas.height !== height) {
      const { devicePixelRatio: ratio = 1 } = window
      const context = canvas.getContext('2d') as CanvasRenderingContext2D
      canvas.width = width * ratio
      canvas.height = height * ratio
      context.scale(ratio, ratio)
      return true
    }
  }
  return false
}
export default resizeCanvasWithDevicePixelRatio