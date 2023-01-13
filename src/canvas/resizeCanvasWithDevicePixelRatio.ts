import { CanvasType } from './Canvas'


const resizeCanvasWithDevicePixelRatio = (canvas: CanvasType) => {
  if (canvas) {
      const width = document.body.clientWidth
      const height =document.documentElement.clientHeight


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