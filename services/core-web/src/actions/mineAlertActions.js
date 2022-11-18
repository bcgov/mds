/* eslint-disable */
import * as ActionTypes from "../constants/actionTypes";

export const storeMineAlerts = (payload) => ({
    type: ActionTypes.STORE_MINE_ALERTS,
    payload,
  });
  
  export const clearMineAlert = () => ({
    type: ActionTypes.CLEAR_MINE_ALERT,
  });