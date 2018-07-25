import { combineReducers } from 'redux';
import * as reducerTypes from '../constants/reducerTypes';
import genericRequest from './networkReducer';

const createReducer = (reducer, name) => (state, action) => {
  if (name !== action.name && state !== undefined) {
    return state;
  }
  return reducer(state, action);
}

const rootReducer = combineReducers({
  [reducerTypes.CREATE_MINE_RECORD]: createReducer(genericRequest, 
  reducerTypes.CREATE_MINE_RECORD)
});

export default rootReducer;
