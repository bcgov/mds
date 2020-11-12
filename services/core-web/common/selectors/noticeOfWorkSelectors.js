import { isEmpty } from "lodash";
import { createSelector } from "reselect";
import * as noticeOfWorkReducer from "../reducers/noticeOfWorkReducer";
import { getDropdownNoticeOfWorkActivityTypeOptions } from "./staticContentSelectors";

export const {
  getNoticeOfWorkList,
  getNoticeOfWorkPageData,
  getNoticeOfWork,
  getOriginalNoticeOfWork,
  getNoticeOfWorkReviews,
  getDocumentDownloadState,
  getApplictionDelay,
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

export const getNOWProgress = createSelector([getNoticeOfWork], (noticeOfWork) => {
  let progress = {};
  if (noticeOfWork.application_progress.length > 0) {
    progress = noticeOfWork.application_progress.reduce(
      (map, obj) => ({ [obj.application_progress_status_code]: { ...obj }, ...map }),
      {}
    );
  }
  return progress;
});
