import { combineReducers } from 'redux';
import * as reducerTypes from '@/constants/reducerTypes';
import networkReducer from './networkReducer';
import mineReducer from '@/reducers/mineReducer';
import personnelReducer from '@/reducers/personnelReducer';
import authenticationReducer from '@/reducers/authenticationReducer';

const createReducer = (reducer, name) => (state, action) => {
  if (name !== action.name && state !== undefined) {
    return state;
  }
  return reducer(state, action);
}

const rootReducer = combineReducers({
  [reducerTypes.AUTHENTICATION]: authenticationReducer,
  [reducerTypes.MINES]: mineReducer,
  [reducerTypes.PERSONNEL]: personnelReducer,
  [reducerTypes.CREATE_PERSONNEL]: createReducer(networkReducer, reducerTypes.CREATE_PERSONNEL),
  [reducerTypes.GET_PERSONNEL_LIST]: createReducer(networkReducer, reducerTypes.GET_PERSONNEL_LIST),
  [reducerTypes.GET_PERSONNEL]: createReducer(networkReducer, reducerTypes.GET_PERSONNEL),
  [reducerTypes.CREATE_MINE_RECORD]: createReducer(networkReducer, reducerTypes.CREATE_MINE_RECORD),
  [reducerTypes.GET_MINE_RECORDS]: createReducer(networkReducer, reducerTypes.GET_MINE_RECORDS),
  [reducerTypes.GET_MINE_RECORD]: createReducer(networkReducer, reducerTypes.GET_MINE_RECORD),
  [reducerTypes.UPDATE_MINE_RECORD]: createReducer(networkReducer, reducerTypes.UPDATE_MINE_RECORD),
});

export default rootReducer;
