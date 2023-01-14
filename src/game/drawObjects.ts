import {
  BonusInterface,
  EnemyInterface, EnemyProjectileInterface,
  ParticleInterface,
  ProjectileInterface
} from '../reducers/canvasReducer'


export const drawCircleOnCanvas = (ctx: CanvasRenderingContext2D, object: ProjectileInterface) => {
  ctx.beginPath()
  ctx.arc(object.x, object.y, object.radius, 0, Math.PI * 2, false)
  ctx.fillStyle = object.color
  ctx.fill()
}
export const drawRectangleOnCanvas = (ctx: CanvasRenderingContext2D, object: EnemyProjectileInterface) => {
  ctx.beginPath()
  ctx.rect(object.x, object.y, object.width, object.height)
  ctx.fillStyle = object.color
  ctx.fill()
}
export const drawBonusOnCanvas = (ctx: CanvasRenderingContext2D, bonus: BonusInterface) => {
  ctx.beginPath()
  drawStar(bonus.x, bonus.y, bonus.spikes, bonus.radius, bonus.innerRadius, ctx)

  bonus.x = bonus.x - bonus.velocity.x
  bonus.y = bonus.y - bonus.velocity.y

  ctx.closePath()
  ctx.lineWidth = bonus.borderWidth
  ctx.strokeStyle = bonus.borderColor
  ctx.stroke()
  ctx.fillStyle = bonus.color
  ctx.fill()
}
const drawStar = (cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number, ctx: CanvasRenderingContext2D) => {
  let rot = Math.PI / 2 * 3
  let x = cx
  let y = cy
  const step = Math.PI / spikes
  ctx.moveTo(cx, cy - outerRadius)
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius
    y = cy + Math.sin(rot) * outerRadius
    ctx.lineTo(x, y)
    rot += step

    x = cx + Math.cos(rot) * innerRadius
    y = cy + Math.sin(rot) * innerRadius
    ctx.lineTo(x, y)
    rot += step
  }
  ctx.lineTo(cx, cy - outerRadius)

}

export const drawParticles = (ctx: CanvasRenderingContext2D, particle: ParticleInterface) => {
  ctx.save()
  ctx.globalAlpha = particle.opacity
  drawCircleOnCanvas(ctx, particle)
  ctx.restore()
  gravityOfFallingObject(particle)
  particle.opacity -= 0.003
}
export const drawEnemies = (
  ctx: CanvasRenderingContext2D,
  enemy: EnemyInterface,
  enemiesBlock: Array<EnemyInterface>,
) => {
  ctx.drawImage(enemy.image, enemy.x, enemy.y, enemy.width, enemy.height)
  if(enemy.x + enemy.width > document.body.clientWidth) {
    enemiesBlock.forEach(enemy => {
      enemy.velocity.x = -1
      enemy.y += 10
    })
  }else if(enemy.x  < 0){
    enemiesBlock.forEach(enemy => {
      enemy.velocity.x = 1
      enemy.y += 10
    })
  }
  enemy.x = enemy.x + enemy.velocity.x
  enemy.y = enemy.y + enemy.velocity.y

}

export const gravityOfFallingObject = (object: ParticleInterface) => {
  object.velocity.x *= object.friction
  object.velocity.y *= object.friction
  object.velocity.y += object.gravity
  object.x = object.x + object.velocity.x
  object.y = object.y + object.velocity.y

}

export const drawBackground = ( ctx: CanvasRenderingContext2D, backgroundParticles: Array<ParticleInterface>) => {
  backgroundParticles.forEach(particle => {
    ctx.save()
    drawCircleOnCanvas(ctx, particle)
    ctx.restore()
    gravityOfFallingObject(particle)
    if(particle.y > window.innerHeight){
      particle.y = 0
      particle.x = Math.round(Math.random() * document.body.clientWidth)
    }
  })
}