import { createSelector } from "reselect";
import * as projectSummaryReducer from "../reducers/projectSummaryReducer";

export const { getProjectSummaries, getProjectSummary, getProjectSummaryPageData } = projectSummaryReducer;

// export const getVarianceApplications = createSelector(
//   [getVariances],
//   (variances) =>
//     variances.filter(
//       ({ variance_application_status_code }) => variance_application_status_code !== "APP"
//     )
// );

// export const getApprovedVariances = createSelector(
//   [getVariances],
//   (variances) =>
//     variances.filter(
//       ({ variance_application_status_code }) => variance_application_status_code === "APP"
//     )
// );

// export const getVarianceApplicationsInReview = createSelector(
//   [getVariances],
//   (variances) =>
//     variances.filter(
//       ({ variance_application_status_code }) => variance_application_status_code === "REV"
//     )
// );
