import * as actionTypes from "@/constants/actionTypes";
import { STATIC_CONTENT } from "@/constants/reducerTypes";

/**
 * @file staticContentReducer.js
 * all data associated with static content to populate form inputs is handled witnin this reducer.
 */

const initialState = {
  expectedDocumentStatusOptions: [],
};

const staticContentReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_DOCUMENT_STATUS_OPTIONS:
      return {
        ...state,
        expectedDocumentStatusOptions: action.payload.options,
      };
    default:
      return state;
  }
};

export const getExpectedDocumentStatusOptions = (state) =>
  state[STATIC_CONTENT].expectedDocumentStatusOptions;

export default staticContentReducer;
