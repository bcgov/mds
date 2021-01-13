/* eslint-disable */
import { createSelector } from "reselect";
import { getNoticeOfWork } from "@common/selectors/noticeOfWorkSelectors";
import * as permitReducer from "../reducers/permitReducer";

const draft = "DFT";

export const {
  getPermits,
  getDraftPermits,
  getPermitConditions,
  getEditingConditionFlag,
} = permitReducer;

export const getDraftPermitForNOW = createSelector(
  [getDraftPermits, getNoticeOfWork],
  (draftPermits, noticeOfWork) =>
    draftPermits.find(({ permit_amendments }) =>
      permit_amendments.some(
        (amendment) => amendment.now_application_guid === noticeOfWork.now_application_guid
      )
    ) || {}
);

export const getDraftPermitAmendmentForNOW = createSelector(
  [getDraftPermits, getNoticeOfWork],
  (draftPermits, noticeOfWork) => {
    const draftPermit = draftPermits.find(({ permit_amendments }) =>
      permit_amendments.some(
        (amendment) => amendment.now_application_guid === noticeOfWork.now_application_guid
      )
    );
    return draftPermit && draftPermit.permit_amendments.length > 0
      ? draftPermit.permit_amendments.filter(
          (amendment) =>
            amendment.now_application_guid === noticeOfWork.now_application_guid &&
            amendment.permit_amendment_status_code === draft
        )[0]
      : {};
  }
);
