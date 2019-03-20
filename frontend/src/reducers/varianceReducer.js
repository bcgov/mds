import * as actionTypes from "@/constants/actionTypes";
import { VARIANCES } from "@/constants/reducerTypes";

const initialState = {
  variances: [],
};

const varianceReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_VARIANCES:
      return {
        ...state,
        variances: action.payload,
      };
    default:
      return state;
  }
};

export const getVariances = (state) => state[VARIANCES].variances;

export default varianceReducer;
