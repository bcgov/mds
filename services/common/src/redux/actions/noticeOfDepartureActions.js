import * as ActionTypes from "@mds/common/constants/actionTypes";

export const storeNoticesOfDeparture = (payload) => ({
  type: ActionTypes.STORE_NOTICES_OF_DEPARTURE,
  payload,
});

export const storeNoticeOfDeparture = (payload) => ({
  type: ActionTypes.STORE_NOTICE_OF_DEPARTURE,
  payload,
});
