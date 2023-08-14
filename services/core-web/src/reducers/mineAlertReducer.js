import { MINE_ALERTS } from "@/constants/reducerTypes";
import * as actionTypes from "../constants/actionTypes";

const initialState = {
  mineAlerts: [],
  globalMineAlerts: [],
};

export const mineAlertReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_MINE_ALERTS:
      return {
        ...state,
        mineAlerts: action.payload.records,
      };
    case actionTypes.STORE_GLOBAL_MINE_ALERTS:
      return {
        ...state,
        globalMineAlerts: action.payload.records,
      };
    default:
      return state;
  }
};

const mineAlertReducerObject = {
  [MINE_ALERTS]: mineAlertReducer,
};

export const getMineAlerts = (state) => state[MINE_ALERTS].mineAlerts;
export const getGlobalMineAlerts = (state) => state[MINE_ALERTS].globalMineAlerts;

export default mineAlertReducerObject;
