import { createSelector } from "reselect";
import * as varianceReducer from "@/reducers/varianceReducer";
import * as Strings from "@/constants/strings";

export const { getVariances, getVariance, getVariancePageData } = varianceReducer;

export const getVarianceApplications = createSelector(
  [getVariances],
  (variances) =>
    variances.filter(
      ({ variance_application_status_code }) =>
        variance_application_status_code !== Strings.VARIANCE_APPROVED_CODE
    )
);

export const getApprovedVariances = createSelector(
  [getVariances],
  (variances) =>
    variances.filter(
      ({ variance_application_status_code }) =>
        variance_application_status_code === Strings.VARIANCE_APPROVED_CODE
    )
);

export const getVarianceApplicationsInReview = createSelector(
  [getVariances],
  (variances) =>
    variances.filter(
      ({ variance_application_status_code }) =>
        variance_application_status_code === Strings.VARIANCE_APPLICATION_CODE
    )
);
