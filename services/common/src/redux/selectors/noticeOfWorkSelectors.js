import { isEmpty, isNil } from "lodash";
import { createSelector } from "reselect";
import moment from "moment";
import { getDurationTextInDays } from "@common/utils/helpers";
import * as noticeOfWorkReducer from "../reducers/noticeOfWorkReducer";
import {
  getDropdownNoticeOfWorkActivityTypeOptions,
  getDropdownNoticeOfWorkApplicationTypeOptions,
} from "./staticContentSelectors";

export const {
  getNoticeOfWorkList,
  getNoticeOfWorkPageData,
  getNoticeOfWorkUnformatted,
  getOriginalNoticeOfWork,
  getImportNowSubmissionDocumentsJob,
  getNoticeOfWorkReviews,
  getDocumentDownloadState,
  getApplicationDelays,
} = noticeOfWorkReducer;

export const getNOWReclamationSummary = createSelector(
  [getNoticeOfWorkUnformatted, getDropdownNoticeOfWorkActivityTypeOptions],
  (noticeOfWork, options) => {
    const reclamationList = [];
    if (options.length > 0) {
      options.forEach(({ value, label }) => {
        // If the object is empty - it means the NOW does not contain that specific activity.
        // if the object does not contain total_disturbed_area || reclamation_cost - it means the activity doesn't have any reclamation data
        if (
          !isEmpty(noticeOfWork[value]) &&
          (!isNil(noticeOfWork[value].calculated_total_disturbance) ||
            !isNil(noticeOfWork[value].total_disturbed_area) ||
            !isNil(noticeOfWork[value].reclamation_cost))
        ) {
          reclamationList.push({
            value,
            label,
            total: noticeOfWork[value].calculated_total_disturbance
              ? noticeOfWork[value].calculated_total_disturbance
              : "0.00",
            cost: noticeOfWork[value].reclamation_cost
              ? noticeOfWork[value].reclamation_cost
              : "0.00",
            originalTotal: noticeOfWork[value].total_disturbed_area
              ? noticeOfWork[value].total_disturbed_area
              : "N/A",
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
  [getNoticeOfWorkUnformatted, getTotalApplicationDelayDuration],
  (noticeOfWork, delayDurations) => {
    const today = new Date();
    let progress = {};
    let status = "Not started";
    if (noticeOfWork.application_progress?.length > 0) {
      progress = noticeOfWork.application_progress.reduce((map, obj) => {
        if (obj.start_date && !obj.end_date) {
          status = "In Progress";
        } else if (obj.start_date && obj.end_date) {
          status = "Complete";
        }
        const endDate = obj.end_date ? obj.end_date : today;
        const duration = moment.duration(moment(endDate).diff(moment(obj.start_date)));
        // eslint-disable-next-line no-underscore-dangle
        const difference = duration._milliseconds - delayDurations.milliseconds;
        const durationDifference = moment.duration(difference, "milliseconds");
        return {
          [obj.application_progress_status_code]: {
            ...obj,
            status,
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

export const getNoticeOfWork = createSelector([getNoticeOfWorkUnformatted], (noticeOfWork) => {
  const siteProperty = noticeOfWork.site_property;
  const siteProperties = {
    mine_tenure_type_code: "",
    mine_commodity_code: [],
    mine_disturbance_code: [],
  };

  if (siteProperty) {
    siteProperties.mine_tenure_type_code = siteProperty.mine_tenure_type_code;
    if (siteProperty.mine_type_detail) {
      siteProperty.mine_type_detail.forEach((detail) => {
        if (detail.mine_commodity_code) {
          siteProperties.mine_commodity_code.push(detail.mine_commodity_code);
        } else if (detail.mine_disturbance_code) {
          siteProperties.mine_disturbance_code.push(detail.mine_disturbance_code);
        }
      });
    }
  }

  return {
    ...noticeOfWork,
    application_reason_codes:
      noticeOfWork.application_reason_codes && noticeOfWork.application_reason_codes.length > 0
        ? noticeOfWork.application_reason_codes.map((c) => c.application_reason_code)
        : [],
    site_property: siteProperties,
  };
});

export const getNoticeOfWorkEditableTypes = createSelector(
  [getNoticeOfWorkUnformatted, getDropdownNoticeOfWorkApplicationTypeOptions],
  (application, applicationTypeOptions) => {
    const editableOptions = ["QIM", "QCA"];
    if (application.application_type_code === "NOW") {
      editableOptions.push("SAG");
    }
    return applicationTypeOptions.filter((o) => editableOptions.includes(o.value));
  }
);
