import * as ActionTypes from '../constants/actionTypes';

export const storePersonnelList = (payload) => {
  return {
    type: ActionTypes.STORE_PERSONNEL_LIST,
    payload,
  }
}

export const storePersonnel = (payload, id) => {
  return {
    type: ActionTypes.STORE_PERSONNEL,
    payload,
    id,
  }
}