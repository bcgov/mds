import { isEmpty, get } from "lodash";
import { createSelector } from "reselect";
import { flattenObject } from "@common/utils/helpers";
import * as noticeOfWorkReducer from "../reducers/noticeOfWorkReducer";
import { getDropdownNoticeOfWorkActivityTypeOptions } from "./staticContentSelectors";

export const {
  getNoticeOfWorkList,
  getNoticeOfWorkPageData,
  getNoticeOfWork,
  getOriginalNoticeOfWork,
  getNoticeOfWorkReviews,
  getDocumentDownloadState,
} = noticeOfWorkReducer;

export const getNOWReclamationSummary = createSelector(
  [getNoticeOfWork, getDropdownNoticeOfWorkActivityTypeOptions],
  (noticeOfWork, options) => {
    const reclamationList = [];
    if (options.length > 0) {
      options.forEach(({ value, label }) => {
        // If the object is empty - it means the NOW does not contain that specific activity.
        // if the object does not contain total_disturbed_area || reclamation_cost - it means the activity doesn't have any reclamation data
        if (
          !isEmpty(noticeOfWork[value]) &&
          noticeOfWork[value].total_disturbed_area !== undefined &&
          noticeOfWork[value].reclamation_cost !== undefined
        ) {
          reclamationList.push({
            label,
            total: noticeOfWork[value].total_disturbed_area
              ? noticeOfWork[value].total_disturbed_area
              : "0.00",
            cost: noticeOfWork[value].reclamation_cost
              ? noticeOfWork[value].reclamation_cost
              : "0.00",
          });
        }
      });
    }
    return reclamationList;
  }
);

export const getOriginalValuesIfEdited = createSelector(
  [getNoticeOfWork, getOriginalNoticeOfWork],
  (noticeOfWork, originalNoticeOfWork) => {
    const current = flattenObject(noticeOfWork);
    const keys = Object.keys(current);
    keys.map((path) => {
      const prevValue = get(originalNoticeOfWork, path);
      const currentValue = get(noticeOfWork, path);
      const prevValueExisted = prevValue !== null || prevValue !== undefined;
      if (prevValue !== currentValue && prevValueExisted) {
        // check if the value has changed, if so, set it to be the previous value
        current[path] = prevValue;
        return current;
      }
      // otherwise return null, the FE checks if null and doesn't show 'Edited'
      current[path] = null;
      return current;
    });
    return current;
  }
);
