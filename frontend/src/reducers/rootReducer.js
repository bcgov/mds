import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { loadingBarReducer } from 'react-redux-loading-bar'
import * as reducerTypes from '@/constants/reducerTypes';
import networkReducer from './networkReducer';
import mineReducer from '@/reducers/mineReducer';
import personnelReducer from '@/reducers/personnelReducer';
import authenticationReducer from '@/reducers/authenticationReducer';

export const createReducer = (reducer, name) => (state, action) => {
  if (name !== action.name && state !== undefined) {
    return state;
  }
  return reducer(state, action);
}

export const reducerObject = {
  form: formReducer,
  loadingBar: loadingBarReducer,
  [reducerTypes.AUTHENTICATION]: authenticationReducer,
  [reducerTypes.MINES]: mineReducer,
  [reducerTypes.PERSONNEL]: personnelReducer,
  [reducerTypes.CREATE_PERSONNEL]: createReducer(networkReducer, reducerTypes.CREATE_PERSONNEL),
  [reducerTypes.GET_PERSONNEL_LIST]: createReducer(networkReducer, reducerTypes.GET_PERSONNEL_LIST),
  [reducerTypes.GET_PERSONNEL]: createReducer(networkReducer, reducerTypes.GET_PERSONNEL),
  [reducerTypes.CREATE_MINE_RECORD]: createReducer(networkReducer, reducerTypes.CREATE_MINE_RECORD),
  [reducerTypes.GET_MINE_RECORDS]: createReducer(networkReducer, reducerTypes.GET_MINE_RECORDS),
  [reducerTypes.GET_MINE_RECORD]: createReducer(networkReducer, reducerTypes.GET_MINE_RECORD),
  [reducerTypes.GET_MINE_NAME_LIST]: createReducer(networkReducer, reducerTypes.GET_MINE_NAME_LIST),
  [reducerTypes.UPDATE_MINE_RECORD]: createReducer(networkReducer, reducerTypes.UPDATE_MINE_RECORD),
  [reducerTypes.ADD_MINE_MANAGER]: createReducer(networkReducer, reducerTypes.ADD_MINE_MANAGER),
};

export const rootReducer = combineReducers(reducerObject);
