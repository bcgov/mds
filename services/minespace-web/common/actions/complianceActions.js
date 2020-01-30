import * as ActionTypes from "../constants/actionTypes";

// This file is anticipated to have multiple exports
// eslint-disable-next-line import/prefer-default-export
export const storeMineComplianceInfo = (payload) => ({
  type: ActionTypes.STORE_MINE_COMPLIANCE_INFO,
  payload,
});
