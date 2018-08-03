import * as mineReducer from '@/reducers/mineReducer';

export const getMines = (state) => mineReducer.getMines(state);
export const getMineIds = (state) => mineReducer.getMineIds(state);
export const getMine = (state) => mineReducer.getMine(state);