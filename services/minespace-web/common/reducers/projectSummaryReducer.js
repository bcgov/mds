import * as actionTypes from "../constants/actionTypes";
import { PROJECT_SUMMARIES } from "../constants/reducerTypes";

const initialState = {
  projectSummaries: [],
  projectSummary: {},
  projectSummaryPageData: {},
};

export const projectSummaryReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_PROJECT_SUMMARIES:
      return {
        ...state,
        projectSummaries: action.payload.records,
        projectSummaryPageData: action.payload,
      };
    case actionTypes.STORE_PROJECT_SUMMARY:
      return {
        ...state,
        projectSummary: action.payload,
      };
    default:
      return state;
  }
};

const projectSummaryReducerObject = {
  [PROJECT_SUMMARIES]: projectSummaryReducer,
};

export const getProjectSummaries = (state) => state[PROJECT_SUMMARIES].projectSummaries;
export const getProjectSummary = (state) => state[PROJECT_SUMMARIES].projectSummary;
export const getProjectSummaryPageData = (state) => state[PROJECT_SUMMARIES].projectSummaryPageData;

export default projectSummaryReducerObject;
