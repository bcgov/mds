import * as ActionTypes from "../constants/actionTypes";

export const storeTenureTypes = (payload) => ({
  type: ActionTypes.STORE_TENURE_TYPES,
  payload,
});

export const storeStatusOptions = (payload) => ({
  type: ActionTypes.STORE_STATUS_OPTIONS,
  payload,
});

export const storeRegionOptions = (payload) => ({
  type: ActionTypes.STORE_REGION_OPTIONS,
  payload,
});

export const storeDisturbanceOptions = (payload) => ({
  type: ActionTypes.STORE_DISTURBANCE_OPTIONS,
  payload,
});
