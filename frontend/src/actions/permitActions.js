import * as actionTypes from "../constants/actionTypes";

const storePermits = (payload) => ({
  type: actionTypes.STORE_PERMITS,
  payload,
});

export default storePermits;
