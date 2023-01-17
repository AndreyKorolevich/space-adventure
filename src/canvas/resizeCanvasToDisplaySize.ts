import { CanvasType } from './Canvas'
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../game/constants'

const resizeCanvasToDisplaySize = (canvas: CanvasType) => {

  const width = CANVAS_WIDTH
  const height = CANVAS_HEIGHT
  if (canvas) {
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
      return true // here you can return some usefull information like delta width and delta height instead of just true
      // this information can be used in the next redraw...
    }
  }

  return false
}

export default resizeCanvasToDisplaySize