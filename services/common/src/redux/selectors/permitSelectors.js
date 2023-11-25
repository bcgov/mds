/* eslint-disable */
import { createSelector } from "reselect";
import { getNoticeOfWork } from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import * as permitReducer from "../reducers/permitReducer";

const draft = "DFT";

export const {
  getUnformattedPermits,
  getDraftPermits,
  getPermitConditions,
  getStandardPermitConditions,
  getEditingConditionFlag,
  getEditingPreambleFlag,
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

export const getPermits = createSelector([getUnformattedPermits], (permits) => {
  const formattedPermits = permits.map((permit) => {
    const site_properties = {
      mine_tenure_type_code: "",
      mine_commodity_code: [],
      mine_disturbance_code: [],
    };

    let activePermitSiteProperty = site_properties;
    if (permit.site_properties.length > 0) {
      activePermitSiteProperty = permit.site_properties.map((type) => {
        site_properties.mine_tenure_type_code = type.mine_tenure_type_code;
        type.mine_type_detail.forEach((detail) => {
          if (detail.mine_commodity_code) {
            site_properties.mine_commodity_code.push(detail.mine_commodity_code);
          } else if (detail.mine_disturbance_code) {
            site_properties.mine_disturbance_code.push(detail.mine_disturbance_code);
          }
        });
        return site_properties;
      })[0];
    }
    return { ...permit, site_properties: activePermitSiteProperty };
  });
  return formattedPermits;
});
