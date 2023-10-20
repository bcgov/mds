import { MINE_ALERTS } from "@/constants/reducerTypes";
import * as actionTypes from "../constants/actionTypes";
import { RootState } from "@/App";
import { IMineAlert, IMineAlertList } from "@mds/common";

interface AlertState {
  mineAlerts: IMineAlert[];
  globalMineAlerts: { records: IMineAlert[]; loaded: boolean };
}
const initialState: AlertState = {
  mineAlerts: [],
  globalMineAlerts: { records: [], loaded: false },
};

export const mineAlertReducer = (state: AlertState = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_MINE_ALERTS:
      return {
        ...state,
        mineAlerts: action.payload.records,
      };
    case actionTypes.STORE_GLOBAL_MINE_ALERTS:
      return {
        ...state,
        globalMineAlerts: { records: action.payload.records, loaded: true },
      };
    default:
      return state;
  }
};

const mineAlertReducerObject = {
  [MINE_ALERTS]: mineAlertReducer,
};

export const getMineAlerts = (state: RootState): IMineAlertList => state[MINE_ALERTS].mineAlerts;
export const getGlobalMineAlerts = (state: RootState): IMineAlertList =>
  state[MINE_ALERTS].globalMineAlerts;

export default mineAlertReducerObject;
