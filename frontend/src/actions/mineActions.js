import * as ActionTypes from '../constants/actionTypes';

export const addMine = (payload) => {
    return {
      type: ActionTypes.ADD_MINE_RECORD,
      payload,
    }
  }

export const updateMine = (payload) => {
  return {
    type: ActionTypes.UPDATE_MINE_RECORD,
    payload,
  }
}

export const storeMines = (payload) => {
  return {
    type: ActionTypes.STORE_MINE_RECORDS,
    payload,
  }
}

export const storeMine = (payload, id) => {
  return {
    type: ActionTypes.STORE_MINE_RECORD,
    payload,
    id,
  }
}