import * as actionTypes from "../constants/actionTypes";

export const storeMinespaceUserList = (payload) => ({
  type: actionTypes.STORE_MINESPACE_USERS,
  payload,
});

export const storeMinespaceUserMineList = (payload) => ({
  type: actionTypes.STORE_MINESPACE_USER_MINES,
  payload,
});

export const storeEMLIContacts = (payload) => ({
  type: actionTypes.STORE_EMLI_CONTACTS,
  payload,
});

export const storeEMLIContactsByRegion = (payload) => ({
  type: actionTypes.STORE_EMLI_CONTACTS_BY_REGION,
  payload,
});
