import {
  BombInterface,
  BonusInterface,
  EnemyInterface,
  EnemyProjectileInterface,
  ParticleInterface,
  ProjectileInterface
} from '../reducers/canvasReducer'
import { PlayerInterface } from './Player'
import {
  BOMB_COLOR,
  BOMB_RADIUS,
  BONUS_BORDER_COLOR,
  BONUS_BORDER_WIDTH,
  BONUS_COLOR,
  BONUS_INNER_RADIUS,
  BONUS_OUTER_RADIUS,
  BONUS_SPIKES,
  BONUS_TIME,
  CANVAS_HEIGHT,
  CANVAS_WIDTH, DEFAULT_PARTICLE_COLOR, DEFAULT_PROJECTILE_COLOR, PARTICLE_SPED,
  SHOT_SIZE,
  SPIED_SHOTS
} from './constants'
import { randomIntFromRange } from '../utils/utils'
import { ControllerType } from './controller'
import { bombSound, obtainPowerUpSound, shootSound } from '../utils/sounds'
import enemy from '../img/enemy.png'
import gsap from 'gsap'

export const removeProjectileOfScreen = (
  projectiles: Array<ProjectileInterface | EnemyProjectileInterface>,
  projectile: ProjectileInterface | EnemyProjectileInterface,
  projectileSize: number,
  indexP: number
) => {

  if (projectile.x + projectileSize > CANVAS_WIDTH ||
    projectile.x - projectileSize < 0 ||
    projectile.y - projectileSize < 0 ||
    projectile.y + projectileSize > CANVAS_HEIGHT) {
    setTimeout(() => {
      projectiles.splice(indexP, 1)
    }, 0)
  }
}
export const addParticles = (
  object: EnemyInterface | PlayerInterface,
  particles: Array<ParticleInterface>,
  color?: string
) => {

  const xCollision = object.x + object.width / 2
  const yCollision = object.y + (object.height / (color ? 1 : 2)) // we change divider to move the center of crating particles for an enemy or the player
  const particleColor = color || DEFAULT_PARTICLE_COLOR

  for (let i = 0; i < 10; i++) {
    const particleRadius = Math.random() * 3
    const particleVelocity = {
      x: (Math.random() - 0.5) * (Math.random() * PARTICLE_SPED),
      y: (Math.random() - 0.5) * (Math.random() * PARTICLE_SPED)
    }

    const newParticle: ParticleInterface = {
      x: xCollision,
      y: yCollision,
      radius: particleRadius,
      color: particleColor,
      velocity: particleVelocity,
      gravity: 0.002,
      friction: 0.99,
      opacity: 1
    }
    particles.push(newParticle)
  }
}

export const removeParticles = (particles: Array<ParticleInterface>, indexP: number) => {
  setTimeout(() => {
    particles.splice(indexP, 1)
  }, 0)
}
export const deleteCollision = (
  projectiles: Array<ProjectileInterface>,
  enemyBlock: Array<EnemyInterface>,
  indexP: number,
  indexE: number
) => {
  setTimeout(() => {
    projectiles.splice(indexP, 1)
    enemyBlock.splice(indexE, 1)
  }, 0)
}

export const addProjectile = (projectiles: Array<ProjectileInterface>, player: PlayerInterface) => {
  shootSound()
  const velocity = {
    x: 0,
    y: -SPIED_SHOTS
  }

  const newProjectile: ProjectileInterface = {
    x: player.x + player.width / 2,
    y: player.y + player.height / 2,
    radius: SHOT_SIZE,
    color: DEFAULT_PROJECTILE_COLOR,
    velocity
  }
  projectiles.push(newProjectile)
}

export const addNewEnemies = (enemies: Array<Array<EnemyInterface>>) => {
  const image = new Image()
  image.src = enemy
  image.onload = () => {
    const enemiesBlock = []
    let x = 0
    let y = 0
    const rows = Math.floor(Math.random() * 2) + 3
    const columns = Math.floor(Math.random() * 6) + 4

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        const newEnemy: EnemyInterface = {
          speed: 1,
          x,
          y,
          image,
          width: image.width,
          height: image.height,
          velocity: {
            x: 1,
            y: 0
          }
        }
        x += image.width
        enemiesBlock.push(newEnemy)
      }
      y += image.height
      x = 0
    }
    enemies.push(enemiesBlock)
  }
}

export const removeEmptyEnemyBlock = (
  enemiesBlock: Array<EnemyInterface>,
  enemies: Array<Array<EnemyInterface>>,
  enemyIndex: number
) => {
  if (enemiesBlock.length === 0) {
    setTimeout(() => {
      enemies.splice(enemyIndex, 1)
    }, 0)
  }
}

export const explodeBomb = (bomb: BombInterface) => {
  bombSound()
  bomb.active = true
  bomb.velocity.x = 0
  bomb.velocity.y = 0
  gsap.to(bomb, {
    radius: 150,
    color: 'white'
  })

  gsap.to(bomb, {
    delay: 0.1,
    opacity: 0,
    duration: 0.15
  })
}

export const addNewBomb = (bombs: Array<BombInterface>) => {
  const bomb: BombInterface = {
    x: randomIntFromRange(BOMB_RADIUS, CANVAS_WIDTH - BOMB_RADIUS),
    y: randomIntFromRange(BOMB_RADIUS, CANVAS_HEIGHT - BOMB_RADIUS),
    velocity: {
      x: (Math.random() - 0.5) * 4,
      y: (Math.random() - 0.5) * 4
    },
    color: BOMB_COLOR,
    opacity: 1,
    active: false,
    radius: 0
  }
  gsap.to(bomb, {
    radius: BOMB_RADIUS
  })
  bombs.push(bomb)
}

export const moveBomb = (bomb: BombInterface) => {
  bomb.x += bomb.velocity.x
  bomb.y += bomb.velocity.y

  if (
    bomb.x + bomb.radius + bomb.velocity.x >= CANVAS_WIDTH ||
    bomb.x - bomb.radius + bomb.velocity.x <= 0
  ) {
    bomb.velocity.x = -bomb.velocity.x
  } else if (
    bomb.y + bomb.radius + bomb.velocity.y >= CANVAS_HEIGHT ||
    bomb.y - bomb.radius + bomb.velocity.y <= 0
  )
    bomb.velocity.y = -bomb.velocity.y
}

export const addNewBonus = (bonuses: Array<BonusInterface>) => {
  const yPos = Math.floor(Math.random() * CANVAS_HEIGHT / 2 ) + BONUS_OUTER_RADIUS
  const bonusVelocity = {
    x: 1,
    y: 0
  }
  const newBonus = {
    x: 0,
    y: yPos,
    radius: BONUS_OUTER_RADIUS,
    innerRadius: BONUS_INNER_RADIUS,
    color: BONUS_COLOR,
    time: BONUS_TIME,
    borderColor: BONUS_BORDER_COLOR,
    velocity: bonusVelocity,
    spikes: BONUS_SPIKES,
    borderWidth: BONUS_BORDER_WIDTH
  }
  bonuses.push(newBonus)
}

export const checkIntakeBonus = (
  bonuses: Array<BonusInterface>,
  player: PlayerInterface,
  projectiles: Array<ProjectileInterface>,
  controller: ControllerType,
  indexBonus: number,
  indexProjectile: number
) => {
  const bonus = bonuses[indexBonus]
  const projectile = projectiles[indexProjectile]
  const distanceToPlayer = Math.hypot(bonus.x - projectile.x, bonus.y - projectile.y)
  if (distanceToPlayer < bonus.radius + projectile.radius) {
    obtainPowerUpSound()
    setTimeout(() => {
      projectiles.splice(indexProjectile, 1)
      bonuses.splice(indexBonus, 1)
    }, 0)

    player.machineGunMode = true
    setTimeout(() => {
      player.machineGunMode = false
    }, bonus.time)
  }
}



