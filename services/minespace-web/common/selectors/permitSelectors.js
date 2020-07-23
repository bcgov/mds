/* eslint-disable */
import { createSelector } from "reselect";
import { getNoticeOfWork } from "@common/selectors/noticeOfWorkSelectors";
import * as permitReducer from "../reducers/permitReducer";

export const { getPermits, getDraftPermits } = permitReducer;

export const getDraftPermitForNOW = createSelector(
  [getDraftPermits, getNoticeOfWork],
  (draftPermits, noticeOfWork) => {
    let draftPermit;
    draftPermits.map((permit) => {
      permit.permit_amendments.map((amendment) => {
        amendment.now_application_guid === noticeOfWork.now_application_guid;
        draftPermit = permit;
      });
    });

    return draftPermit;
  }
);
