/* eslint-disable */
import { createSelector } from "reselect";
import { getNoticeOfWork } from "@common/selectors/noticeOfWorkSelectors";
import * as permitReducer from "../reducers/permitReducer";

export const { getPermits, getDraftPermits, getPermitConditions } = permitReducer;

export const getDraftPermitForNOW = createSelector(
  [getDraftPermits, getNoticeOfWork],
  (draftPermits, noticeOfWork) =>
    draftPermits.find(({ permit_amendments }) =>
      permit_amendments.some(
        (amendment) => amendment.now_application_guid === noticeOfWork.now_application_guid
      )
    ) || {}
);
