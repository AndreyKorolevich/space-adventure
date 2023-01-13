import {
  BonusInterface,
  EnemyInterface, EnemyProjectileInterface,
  EnemyType,
  ParticleInterface,
  ProjectileInterface
} from '../reducers/canvasReducer'
import { PlayerInterface } from './Player'
import {
  BONUS_BORDER_COLOR,
  BONUS_BORDER_WIDTH,
  BONUS_COLOR,
  BONUS_INNER_RADIUS,
  BONUS_OUTER_RADIUS,
  BONUS_SPIKES, BONUS_TIME,
  ENEMY_TYPE_SPINNING,
  ENEMY_TYPE_SPINNING_TRACKING,
  ENEMY_TYPE_STATIC,
  ENEMY_TYPE_TRACKING,
  MAX_ENEMY_SIZE,
  MIN_ENEMY_SIZE,
  SHOT_SIZE,
  SPIED_ENEMY,
  SPIED_SHOTS,
  xCenter,
  yCenter
} from './constants'
import { calculateObjectVelocity, randomStartPosition } from '../utils/utils'
import { ControllerType } from './controller'
import { obtainPowerUpSound, shootSound } from '../utils/sounds'
import enemy from '../img/enemy.png'

export const removeProjectileOfScreen = (
  projectiles: Array<ProjectileInterface | EnemyProjectileInterface>,
  projectile: ProjectileInterface | EnemyProjectileInterface,
  projectileSize: number,
  indexP: number
) => {

  if (projectile.x + projectileSize > document.body.clientWidth ||
    projectile.x - projectileSize < 0 ||
    projectile.y - projectileSize < 0 ||
    projectile.y + projectileSize > window.innerHeight) {
    setTimeout(() => {
      projectiles.splice(indexP, 1)
    }, 0)
  }
}
export const addParticles = (
  enemy: EnemyInterface,
  projectile: ProjectileInterface,
  particles: Array<ParticleInterface>
) => {
  const angle = Math.atan2(enemy.y - projectile.y, enemy.x - projectile.x)

  const xCollision = enemy.x - (enemy.width * Math.cos(angle))
  const yCollision = enemy.y - (enemy.height * Math.sin(angle))
  const particleColor = 'purple'

  for (let i = 0; i < 20; i++) {
    const particleRadius = Math.random() * 2
    const particleVelocity = {
      x: (Math.random() - 0.5) * (Math.random() * 5),
      y: (Math.random() - 0.5) * (Math.random() * 5)
    }

    const newParticle: ParticleInterface = {
      x: xCollision,
      y: yCollision,
      radius: particleRadius,
      color: particleColor,
      velocity: particleVelocity,
      gravity: 0.005,
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
export const addProjectile = (
  projectiles: Array<ProjectileInterface>,
  player: PlayerInterface
) => {
  shootSound()
  const velocity = {
    x: 0,
    y: -SPIED_SHOTS
  }

  const newProjectile: ProjectileInterface = {
    x: player.x + player.width / 2,
    y: player.y + player.height / 2,
    radius: SHOT_SIZE,
    color: 'white',
    velocity
  }
  projectiles.push(newProjectile)
}
export const addNewEnemies = (
  enemies: Array<Array<EnemyInterface>>
) => {
  const image = new Image()
  image.src = enemy
  image.onload = () => {
    const enemiesBlock = []
    let x = 0
    let y = 0
    const rows = Math.floor(Math.random() * 2) + 3
    const colms = Math.floor(Math.random() * 6) + 4

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < colms; j++) {
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

export const addNewBonus = (bonuses: Array<BonusInterface>) => {
  const { xPos, yPos } = randomStartPosition(BONUS_OUTER_RADIUS)
  const bonusVelocity = calculateObjectVelocity(yPos, yCenter, xPos, xCenter, 1)
  const newBonus = {
    x: xPos,
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
  bonus: BonusInterface,
  player: PlayerInterface,
  controller: ControllerType,
  indexB: number) => {
  const distanceToPlayer = Math.hypot(bonus.x - player.x, bonus.y - player.y)
  if (distanceToPlayer < bonus.radius + player.height) {
    obtainPowerUpSound()
    removeBonusFromCanvas(bonuses, indexB)
    player.machineGunMode = true
    setTimeout(() => {
      player.machineGunMode = false
      controller['Mouse'].pressed = false
    }, bonus.time)
  }
}

export const removeBonusFromCanvas = (bonuses: Array<BonusInterface>, indexB: number) => {
  setTimeout(() => {
    bonuses.splice(indexB, 1)
  }, 0)
}


