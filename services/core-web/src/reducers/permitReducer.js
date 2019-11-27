import * as actionTypes from "@/constants/actionTypes";
import { PERMITS } from "@/constants/reducerTypes";

const initialState = {
  permits: [],
};

const permitReducer = (state = initialState, action) => {
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

export const getPermits = (state) => state[PERMITS].permits;

export default permitReducer;
