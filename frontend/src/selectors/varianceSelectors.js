import * as varianceReducer from "@/reducers/varianceReducer";
import { createSelector } from "reselect";
import * as Strings from "@/constants/strings";

export const { getMineVariances } = varianceReducer;

export const getVarianceApplications = createSelector(
  [getMineVariances],
  (variances) =>
    variances.filter(
      ({ variance_application_status_code }) =>
        variance_application_status_code === Strings.VARIANCE_APPLICATION_CODE
    )
);

export const getApprovedVariances = createSelector(
  [getMineVariances],
  (variances) =>
    variances.filter(
      ({ variance_application_status_code }) =>
        variance_application_status_code === Strings.VARIANCE_APPROVED_CODE
    )
);
