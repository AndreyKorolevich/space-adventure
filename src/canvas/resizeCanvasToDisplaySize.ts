import { CanvasType } from './Canvas'

const resizeCanvasToDisplaySize = (canvas: CanvasType) => {

  const width = document.body.clientWidth
  const height = window.innerHeight
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