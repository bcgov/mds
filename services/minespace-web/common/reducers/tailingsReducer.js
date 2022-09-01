import { TAILINGS } from "../constants/reducerTypes";
import * as actionTypes from "../constants/actionTypes";

const initialState = {
  tsf: {},
};

export const tailingsReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_TAILINGS_STORAGE_FACILITY:
      return {
        ...state,
        tsf: action.payload,
      };
    default:
      return state;
  }
};

const tailingsReducerObject = {
  [TAILINGS]: tailingsReducer,
};

export const getTsf = (state) => state[TAILINGS].tsf;

export default tailingsReducerObject;
