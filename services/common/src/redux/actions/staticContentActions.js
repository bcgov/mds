import * as ActionTypes from "../constants/actionTypes";

// eslint-disable-next-line import/prefer-default-export
export const storeBulkStaticContent = (payload) => ({
  type: ActionTypes.STORE_BULK_STATIC_CONTENT,
  payload,
});
