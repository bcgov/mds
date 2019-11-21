import { isEmpty } from "lodash";
import { createSelector } from "reselect";
import * as noticeOfWorkReducer from "@/reducers/noticeOfWorkReducer";
import { getDropdownNoticeOfWorkActivityTypeOptions } from "@/selectors/staticContentSelectors";

export const {
  getNoticeOfWorkList,
  getNoticeOfWorkPageData,
  getNoticeOfWork,
  getOriginalNoticeOfWork,
} = noticeOfWorkReducer;

export const getNOWReclamationSummary = createSelector(
  [getNoticeOfWork, getDropdownNoticeOfWorkActivityTypeOptions],
  (noticeOfWork, options) => {
    const reclamationList = [];
    if (options.length > 0) {
      options.forEach(({ value, label }) => {
        // If the object is empty - it means the NOW does not contain that specific activity.
        // if the object does not contain total_disturbed_area || reclamation_cost - it means the activity doesn't have any reclamation data
        const keysExist =
          noticeOfWork[value].total_disturbed_area !== undefined ||
          noticeOfWork[value].reclamation_cost !== undefined;
        if (!isEmpty(noticeOfWork[value]) && keysExist) {
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
