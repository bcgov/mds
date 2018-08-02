import * as ActionTypes from '../constants/actionTypes';

export const addMine = (payload) => {
    return {
      type: ActionTypes.ADD_MINE_RECORD,
      payload,
    }
  }

export const storeMines = (payload) => {
  return {
    type: ActionTypes.STORE_MINE_RECORDS,
    payload,
  }
}