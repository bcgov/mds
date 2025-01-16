import * as actionTypes from "@mds/common/constants/actionTypes";

export const storeMinespaceUserList = (payload) => ({
  type: actionTypes.STORE_MINESPACE_USERS,
  payload,
});

export const storeMinespaceUserMineList = (payload) => ({
  type: actionTypes.STORE_MINESPACE_USER_MINES,
  payload,
});

export const storeMinistryContacts = (payload) => ({
  type: actionTypes.STORE_MINISTRY_CONTACTS,
  payload,
});

export const storeMinistryContactsByRegion = (payload) => ({
  type: actionTypes.STORE_MINISTRY_CONTACTS_BY_REGION,
  payload,
});
