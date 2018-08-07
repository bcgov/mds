import * as actionTypes from '@/constants/actionTypes';
import { MINES } from '@/constants/reducerTypes';

const initialState = {
  mines: {},
  mineIds: [],
};

const createItemMap = (array, idField) => {
  return array.reduce((result, item) => {
    result[item[idField]] = item;
    return result;
  }, {});
};

const createItemIdsArray = (array, idField) => {
  return array.map(item => item[idField]);
};

const mineReducer = (state=initialState, action) => {
    switch (action.type) {
      case actionTypes.ADD_MINE_RECORD:
        //TODO: implement behaviour for adding individual mines
        return state;
      case actionTypes.STORE_MINE_RECORDS:
        return {
          ...state,
          mines: createItemMap(action.payload.mines, 'guid'),
          mineIds: createItemIdsArray(action.payload.mines, 'guid'),
        }
      case actionTypes.STORE_MINE_RECORD:
        return {
          ...state,
          mines: createItemMap([action.payload], 'guid'),
          mineIds: createItemIdsArray([action.payload], 'guid'),
        }
      case actionTypes.UPDATE_MINE_RECORD:
        return {
          ...state,
          mines: createItemMap([action.payload], 'guid'),
          mineIds: createItemIdsArray([action.payload], 'guid'),
        }
      case actionTypes.REFRESH:
        return {
          ...state,
        }
      default:
        return state;
    }
};

export const getMines = (state) => state[MINES].mines;
export const getMineIds = (state) => state[MINES].mineIds;

export default mineReducer;