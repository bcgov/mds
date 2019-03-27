import * as actionTypes from "@/constants/actionTypes";
import { VARIANCES } from "@/constants/reducerTypes";

const initialState = {
  mineVariances: [],
};

const varianceReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_VARIANCES:
      return {
        ...state,
        mineVariances: action.payload.records,
      };
    default:
      return state;
  }
};

export const getMineVariances = (state) => state[VARIANCES].mineVariances;

export default varianceReducer;
