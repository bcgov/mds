import * as actionTypes from "@/constants/actionTypes";
import { REPORTS } from "@/constants/reducerTypes";

const initialState = {
  mineReports: [],
};

const reportReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_MINE_REPORTS:
      return {
        ...state,
        mineReports: action.payload.records,
      };
    default:
      return state;
  }
};

export const getMineReports = (state) => state[REPORTS].mineReports;

export default reportReducer;
