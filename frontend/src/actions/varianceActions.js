import * as actionTypes from "../constants/actionTypes";

// This file is anticipated to have multiple exports
// eslint-disable-next-line import/prefer-default-export
export const storeVariances = (payload) => ({
  type: actionTypes.STORE_VARIANCES,
  payload,
});
