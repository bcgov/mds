import * as actionTypes from "@/constants/actionTypes";
import { VARIANCES } from "@/constants/reducerTypes";

const initialState = {
  mineVariances: [],
  variance: {},
};

const varianceReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_VARIANCES:
      return {
        ...state,
        mineVariances: action.payload.records,
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

export const getMineVariances = (state) => state[VARIANCES].mineVariances;
export const getVariance = (state) => state[VARIANCES].variance;

export default varianceReducer;
