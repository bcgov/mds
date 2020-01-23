import * as ActionTypes from "../constants/actionTypes";

// This file is anticipated to have multiple exports
// eslint-disable-next-line import/prefer-default-export
export const storeTestInfo = payload => ({
  type: ActionTypes.STORE_TEST_INFO,
  payload
});
