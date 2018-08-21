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

export const storeMineList = (payload) => {
  return {
    type: ActionTypes.STORE_MINE_LIST,
    payload,
  }
}

export const storeMine = (payload, id) => {
  return {
    type: ActionTypes.STORE_MINE,
    payload,
    id,
  }
}