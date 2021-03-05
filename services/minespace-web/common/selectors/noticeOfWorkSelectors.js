import { isEmpty } from "lodash";
import { createSelector } from "reselect";
import moment from "moment";
import { getDurationTextInDays } from "@common/utils/helpers";
import * as noticeOfWorkReducer from "../reducers/noticeOfWorkReducer";
import { getDropdownNoticeOfWorkActivityTypeOptions } from "./staticContentSelectors";

export const {
  getNoticeOfWorkList,
  getNoticeOfWorkPageData,
  getNoticeOfWork,
  getOriginalNoticeOfWork,
  getImportNowSubmissionDocumentsJob,
  getNoticeOfWorkReviews,
  getDocumentDownloadState,
  getApplicationDelays,
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
          (noticeOfWork[value].calculated_total_disturbance !== undefined ||
            noticeOfWork[value].reclamation_cost !== undefined)
        ) {
          reclamationList.push({
            label,
            total: noticeOfWork[value].calculated_total_disturbance
              ? noticeOfWork[value].calculated_total_disturbance
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

const getAmountSum = (arr) => arr.reduce((sum, ar) => +sum + +ar, 0);
export const getTotalApplicationDelayDuration = createSelector([getApplicationDelays], (delays) => {
  const today = new Date();
  const totalArr = [];
  delays.map((delay) => {
    const endDate = delay.end_date ? delay.end_date : today;
    const delayDuration = moment.duration(moment(endDate).diff(moment(delay.start_date)));
    // eslint-disable-next-line no-underscore-dangle
    return totalArr.push(delayDuration._milliseconds);
  });
  const total = getAmountSum(totalArr);
  const newMoment = moment.duration(total, "milliseconds");
  return { duration: getDurationTextInDays(newMoment), milliseconds: total };
});

export const getNOWProgress = createSelector(
  [getNoticeOfWork, getTotalApplicationDelayDuration],
  (noticeOfWork, delayDurations) => {
    const today = new Date();
    let progress = {};
    if (noticeOfWork.application_progress?.length > 0) {
      progress = noticeOfWork.application_progress.reduce((map, obj) => {
        const endDate = obj.end_date ? obj.end_date : today;
        const duration = moment.duration(moment(endDate).diff(moment(obj.start_date)));
        // eslint-disable-next-line no-underscore-dangle
        const difference = duration._milliseconds - delayDurations.milliseconds;
        const durationDifference = moment.duration(difference, "milliseconds");
        return {
          [obj.application_progress_status_code]: {
            ...obj,
            duration: getDurationTextInDays(duration),
            durationWithoutDelays: getDurationTextInDays(durationDifference),
          },
          ...map,
        };
      }, {});
    }
    return progress;
  }
);

export const getApplicationDelay = createSelector([getApplicationDelays], (delays) => {
  const currentDelay = delays.filter((delay) => delay.end_date === null)[0];
  return currentDelay;
});

export const getApplicationDelaysWithDuration = createSelector([getApplicationDelays], (delays) => {
  const today = new Date();
  const delayWithDuration = delays.map((delay) => {
    const endDate = delay.end_date ? delay.end_date : today;
    const duration = moment.duration(moment(endDate).diff(moment(delay.start_date)));
    return { duration: getDurationTextInDays(duration), ...delay };
  });
  return delayWithDuration;
});
