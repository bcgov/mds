// import { createSelector } from "reselect";
import * as projectSummaryReducer from "../reducers/projectSummaryReducer";

export const {
  getProjectSummary,
  getProjectSummaries,
  getProjectSummaryPageData,
} = projectSummaryReducer;

// export const getFormattedProjectSummary = createSelector([getProjectSummary], (summary) => {
//   let formattedSummary = { ...summary };
//   formattedSummary.authorizations.map(authorization);
//   delete formattedSummary.authorizations;

//   return formattedSummary;
// });
