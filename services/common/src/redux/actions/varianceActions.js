import * as actionTypes from "@mds/common/constants/actionTypes";

export const storeVariances = (payload) => ({
  type: actionTypes.STORE_VARIANCES,
  payload,
});

export const storeVariance = (payload) => ({
  type: actionTypes.STORE_VARIANCE,
  payload,
});
