import * as actionTypes from "../constants/actionTypes";
import { PERMITS } from "../constants/reducerTypes";

const initialState = {
  permits: [],
};

export const permitReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_PERMITS:
      return {
        ...state,
        permits: action.payload.records,
      };
    default:
      return state;
  }
};

const permitReducerObject = {
  [PERMITS]: permitReducer,
};

export const getPermits = (state) => state[PERMITS].permits;

export default permitReducerObject;
