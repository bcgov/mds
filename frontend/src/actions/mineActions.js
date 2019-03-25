import * as ActionTypes from "../constants/actionTypes";

export const storeMineList = (payload) => ({
  type: ActionTypes.STORE_MINE_LIST,
  payload,
});

export const storeMine = (payload, id) => ({
  type: ActionTypes.STORE_MINE,
  payload,
  id,
});

export const storeMineNameList = (payload) => ({
  type: ActionTypes.STORE_MINE_NAME_LIST,
  payload,
});

export const storeMineBasicInfoList = (payload) => ({
  type: ActionTypes.STORE_MINE_BASIC_INFO_LIST,
  payload,
});

export const storeMineDocuments = (payload) => ({
  type: ActionTypes.STORE_MINE_DOCUMENTS,
  payload,
});

export const storeCurrentUserMineVerifiedStatuses = (payload) => ({
  type: ActionTypes.STORE_CURRENT_USER_MINE_VERIFIED_STATUS,
  payload,
});
