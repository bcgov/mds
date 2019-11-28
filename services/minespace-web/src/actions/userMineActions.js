import * as ActionTypes from "../constants/actionTypes";

export const storeUserMineInfo = (payload) => ({
  type: ActionTypes.STORE_USER_MINE_INFO,
  payload,
});

export const storeMine = (payload) => ({
  type: ActionTypes.STORE_MINE,
  payload,
});

export const storeMineDocuments = (payload) => ({
  type: ActionTypes.STORE_MINE_DOCUMENTS,
  payload,
});
