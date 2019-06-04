import * as actionTypes from "@/constants/actionTypes";
import { VARIANCES } from "@/constants/reducerTypes";

const initialState = {
  variances: [],
  variance: {},
};

const varianceReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_VARIANCES:
      return {
        ...state,
        variances: action.payload.records,
      };
    case actionTypes.STORE_VARIANCE:
      return {
        ...state,
        variance: action.payload,
      };
    default:
      return state;
  }
};

export const getVariances = (state) => state[VARIANCES].variances;
export const getVariance = (state) => state[VARIANCES].variance;

export default varianceReducer;
