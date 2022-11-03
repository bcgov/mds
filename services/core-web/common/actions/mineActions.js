import * as ActionTypes from "../constants/actionTypes";

export const storeMineList = (payload) => ({
  type: ActionTypes.STORE_MINE_LIST,
  payload,
});

export const storeMine = (payload) => ({
  type: ActionTypes.STORE_MINE,
  payload,
  id: payload.mine_guid || payload.mineGuid || payload.mine_no || payload.mineNo,
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

export const storeSubscribedMines = (payload) => ({
  type: ActionTypes.STORE_SUBSCRIBED_MINES,
  payload,
});

export const storeCurrentUserMineVerifiedStatuses = (payload) => ({
  type: ActionTypes.STORE_CURRENT_USER_MINE_VERIFIED_STATUS,
  payload,
});

export const storeMineComments = (payload) => ({
  type: ActionTypes.STORE_MINE_COMMENTS,
  payload,
});

export const storeEpicInfo = (payload) => ({
  type: ActionTypes.STORE_MINE_EPIC_INFO,
  payload,
});

export const storeMineAlert = (payload) => ({
  type: ActionTypes.STORE_MINE_ALERT,
  payload,
});

export const storeMineAlerts = (payload) => ({
  type: ActionTypes.STORE_MINE_ALERTS,
  payload,
});

export const clearMineAlert = () => ({
  type: ActionTypes.CLEAR_MINE_ALERT,
});
