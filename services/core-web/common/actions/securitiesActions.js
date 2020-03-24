import * as ActionTypes from "@common/constants/actionTypes";

// This file is anticipated to have multiple exports
// eslint-disable-next-line import/prefer-default-export
export const storeMineBonds = (payload) => ({
  type: ActionTypes.STORE_MINE_BONDS,
  payload,
});
