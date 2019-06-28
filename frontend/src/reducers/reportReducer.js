import * as actionTypes from "@/constants/actionTypes";
import { REPORTS } from "@/constants/reducerTypes";

const initialState = {
  reports: [],
};

const reportReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_MINE_REPORTS:
      return {
        ...state,
        reports: action.payload,
      };
    default:
      return state;
  }
};

export const getMineReports = (state) => state[REPORTS].reports;

export default reportReducer;
