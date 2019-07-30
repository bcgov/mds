import * as ActionTypes from "../constants/actionTypes";

// eslint-disable-next-line import/prefer-default-export
export const storeMineReports = (payload) => ({
  type: ActionTypes.STORE_MINE_REPORTS,
  payload,
});
