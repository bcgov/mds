import * as actionTypes from "@/constants/actionTypes";
import { STATIC_CONTENT } from "@/constants/reducerTypes";

/**
 * @file staticContentReducer.js
 * all data associated with static content to populate form inputs is handled witnin this reducer.
 */

const initialState = {
  mineReportDefinitionOptions: [],
};

const staticContentReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_MINE_REPORT_DEFINITION_OPTIONS:
      return {
        ...state,
        mineReportDefinitionOptions: action.payload.records,
      };
    default:
      return state;
  }
};

export const getMineReportDefinitionOptions = (state) =>
  state[STATIC_CONTENT].mineReportDefinitionOptions;

export default staticContentReducer;
