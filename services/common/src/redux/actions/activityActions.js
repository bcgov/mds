import * as ActionTypes from "@mds/common/constants/actionTypes";

// eslint-disable-next-line import/prefer-default-export
export const storeActivities = (payload) => ({
  type: ActionTypes.STORE_ACTIVITIES,
  payload,
});
