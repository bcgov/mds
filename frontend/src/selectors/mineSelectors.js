import * as mineReducer from '@/reducers/mineReducer';

export const getMines = (state) => mineReducer.getMines(state);
export const getMineIds = (state) => mineReducer.getMineIds(state);
export const getMineNames = (state) => mineReducer.getMineNames(state);
export const getMinesPageData = (state) => mineReducer.getMinesPageData(state);
export const getCurrentPermittees = (state) => mineReducer.getCurrentPermittees(state);
export const getCurrentPermitteeIds = (state) => mineReducer.getCurrentPermitteeIds(state);
export const getMineStatusOptions = (state) => mineReducer.getMineStatusOptions(state);