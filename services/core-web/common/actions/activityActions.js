import * as actionTypes from "../constants/actionTypes";

export const storeCoreActivities = (payload) => ({
  type: actionTypes.STORE_CORE_ACTIVITIES,
  payload,
});

export const storeUserCoreActivities = (payload) => ({
  type: actionTypes.STORE_USER_CORE_ACTIVITIES,
  payload,
});
