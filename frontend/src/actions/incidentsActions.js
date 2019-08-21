import * as actionTypes from "../constants/actionTypes";

// eslint-disable-next-line import/prefer-default-export
export const storeIncidents = (payload) => ({
  type: actionTypes.STORE_INCIDENTS,
  payload,
});
