import * as actionTypes from "../constants/actionTypes";
import { TEST } from "../constants/reducerTypes";

const initialState = {
  testInfo: {}
};

const testReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_TEST_INFO:
      return {
        ...state,
        testInfo: action.payload
      };
    case actionTypes.CLEAR:
      return {
        testInfo: null
      };
    default:
      return state;
  }
};

export const getTestInfo = state => state[TEST].testInfo;

export default testReducer;
