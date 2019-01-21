import * as ActionTypes from "../constants/actionTypes";

// This file is anticipated to have multiple exports
// eslint-disable-next-line import/prefer-default-export
export const storeUserMineInfo = (payload) => ({
  type: ActionTypes.STORE_USER_MINE_INFO,
  payload,
});
