import { configureStore, ThunkAction, Action, combineReducers } from '@reduxjs/toolkit'
import canvasReducer, { CanvasStateType } from '../reducers/canvasReducer'

const reducers = combineReducers({
  canvasReducer,
})

export const store = configureStore({
  reducer: reducers
})

export type AppDispatch = typeof store.dispatch;
export type RootStateType = {
  canvasReducer: CanvasStateType
};

type PropertiesType<T> = T extends { [key: string]: infer U } ? U : never
export type ActionTypes<T extends { [key: string]: (...args: any[]) => any }> = ReturnType<PropertiesType<T>>

export type ThunkType<A extends Action, R = Promise<void>> = ThunkAction<R, RootStateType, unknown, A>
