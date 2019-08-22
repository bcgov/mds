// import { createSelector } from "reselect";
import * as incidentsReducer from "@/reducers/incidentsReducer";
// import * as Strings from "@/constants/strings";

// eslint-disable-next-line import/prefer-default-export
export const { getIncidents, getIncidentPageData } = incidentsReducer;

// export const getVarianceApplications = createSelector(
//   [getVariances],
//   (variances) =>
//     variances.filter(
//       ({ variance_application_status_code }) =>
//         variance_application_status_code !== Strings.VARIANCE_APPROVED_CODE
//     )
// );

// export const getIncidents = createSelector(
//   [getVariances],
//   (variances) =>
//     variances.filter(
//       ({ variance_application_status_code }) =>
//         variance_application_status_code === Strings.VARIANCE_APPROVED_CODE
//     )
// );

// export const getVarianceApplicationsInReview = createSelector(
//   [getVariances],
//   (variances) =>
//     variances.filter(
//       ({ variance_application_status_code }) =>
//         variance_application_status_code === Strings.VARIANCE_APPLICATION_CODE
//     )
// );
