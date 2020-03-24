import * as ActionTypes from "@common/constants/actionTypes";

export const storeMineBonds = (payload) => ({
  type: ActionTypes.STORE_MINE_BONDS,
  payload,
});

export const storeBond = (payload) => ({
  type: ActionTypes.STORE_BOND,
  payload,
});
