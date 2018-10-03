import * as ActionTypes from '../constants/actionTypes';

export const storeParties = (payload) => {
  return {
    type: ActionTypes.STORE_PARTIES,
    payload,
  }
}

export const storeParty = (payload, id) => {
  return {
    type: ActionTypes.STORE_PARTY,
    payload,
    id,
  }
}
