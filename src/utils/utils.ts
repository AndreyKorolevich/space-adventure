export const randomIntFromRange = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export const distance = (x1: number, y1: number, x2: number, y2: number) => {
  const xDist = x2 - x1
  const yDist = y2 - y1

  return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2))
}

/**
 * Rotates coordinate system for velocities
 *
 * Takes velocities and alters them as if the coordinate system they're on was rotated
 *
 * @return Object | The altered x and y velocities after the coordinate system has been rotated
 * @param velocity
 * @param angle
 */

const rotate = (velocity: { x: number, y: number }, angle: number) => {
  return {
    x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
    y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
  }
}

export const randomStartPosition = (objectSize: number) => {
  let xPos = 0
  let yPos = 0

  if (Math.random() > 0.5) {
    xPos = Math.random() > 0.5 ? (0 - objectSize) : (document.body.clientWidth + objectSize)
    yPos = Math.random() * window.innerHeight
  } else {
    xPos = Math.random() * document.body.clientWidth
    yPos = Math.random() > 0.5 ? (0 - objectSize) : (window.innerHeight + objectSize)
  }

  return { xPos, yPos }
}

export const calculateObjectVelocity = (yStart: number, yEnd: number, xStart: number, xEnd: number, objectSpeed: number) => {
  const angle = Math.atan2(yStart - yEnd, xStart - xEnd)
  return {
    x: Math.cos(angle) * objectSpeed,
    y: Math.sin(angle) * objectSpeed
  }
}











