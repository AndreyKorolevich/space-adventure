import { CanvasActionTypes } from '../actions/canvasAction'
import { PointType } from '../components/Points/Point'


export const INCREASE_SCORE = 'INCREASE_SCORE'
export const SHOW_FINAL_MODAL = 'SHOW_FINAL_MODAL'
export const HIDE_START_MODAL = 'HIDE_START_MODAL'
export const START_NEW_GAME = 'START_NEW_GAME'
export const INCREASE_GAME_NUMBER = 'INCREASE_GAME_NUMBER'
export const SET_REFRESH_RATE_MONITOR = 'SET_REFRESH_RATE_MONITOR'
export const ADD_POINT = 'ADD_POINT'
export const DELETE_POINT = 'DELETE_POINT'
export const UPDATE_POINT_POSITIONS = 'UPDATE_POINT_POSITIONS'


export interface GameObjectInterface {
  x: number
  y: number
  color: string
  velocity: {
    x: number,
    y: number
  }
}

export interface ParticleInterface extends GameObjectInterface {
  radius: number
  opacity: number
  gravity: number
  friction: number
}

export interface ProjectileInterface extends GameObjectInterface {
  radius: number
}

export interface EnemyProjectileInterface extends GameObjectInterface {
  height: number
  width: number
}

export interface BombInterface extends GameObjectInterface{
  radius: number
  opacity: number
  active: boolean
}


export interface EnemyInterface {
  x: number
  y: number
  image: HTMLImageElement
  width: number
  height: number
  speed: number,
  velocity: {
    x: number,
    y: number
  }
}

export interface BonusInterface extends GameObjectInterface {
  radius: number
  borderColor: string
  spikes: number
  innerRadius: number
  borderWidth: number
  time: number
}

export type CanvasStateType = {
  mousePosition: {
    x: number
    y: number
  },
  score: number
  isShowFinalModal: boolean
  isShowStartModal: boolean
  gameNumber: number
  refreshRateMonitor: number
  points: Array<PointType>
  colorLastKilledEnemy: string
}

const initialState = {
  mousePosition: {
    x: 0,
    y: 0
  },
  score: 0,
  isShowFinalModal: false,
  isShowStartModal: true,
  gameNumber: 0,
  refreshRateMonitor: 0,
  points: [],
  colorLastKilledEnemy: 'rgba(44.0, 29.0, 108.0, 1)'
}

export default (state: CanvasStateType = initialState, action: CanvasActionTypes) => {
  switch (action.type) {
    case INCREASE_SCORE: {
      return {
        ...state,
        score: state.score + action.payload.count
      }
    }
    case SET_REFRESH_RATE_MONITOR: {
      return {
        ...state,
        refreshRateMonitor: action.payload.refreshRateMonitor
      }
    }
    case SHOW_FINAL_MODAL: {
      return {
        ...state,
        isShowFinalModal: true
      }
    }
    case HIDE_START_MODAL: {
      return {
        ...state,
        isShowStartModal: false
      }
    }
    case START_NEW_GAME: {
      return {
        ...state,
        score: 0,
        isShowFinalModal: false,
        points: []
      }
    }
    case INCREASE_GAME_NUMBER: {
      return {
        ...state,
        gameNumber: state.gameNumber + 1
      }
    }
    case ADD_POINT: {
      return {
        ...state,
        points: [...state.points, action.payload.point]
      }
    }
    case DELETE_POINT: {
      return {
        ...state,
        points: state.points.filter(point => point.id !== action.payload.id)
      }
    }
    case UPDATE_POINT_POSITIONS: {
      return {
        ...state,
        points: state.points.map(point => {
          if (point.id === action.payload.id) {
            return {
              ...point,
              top: point.top - 0.7,
              opacity: point.opacity - 0.02
            }
          }
          return point
        })
      }
    }
    default:
      return state
  }
}


