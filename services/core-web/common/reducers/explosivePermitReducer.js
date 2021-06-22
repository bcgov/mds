import * as actionTypes from "../constants/actionTypes";
import { EXPLOSIVE_PERMITS } from "../constants/reducerTypes";

const initialState = {
  explosivePermits: [],
};

export const explosivePermitReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_EXPLOSIVE_PERMITS:
      return {
        ...state,
        explosivePermits: action.payload.records,
      };
    default:
      return state;
  }
};

const explosivePermitReducerObject = {
  [EXPLOSIVE_PERMITS]: explosivePermitReducer,
};

export const getExplosivePermits = (state) => state[EXPLOSIVE_PERMITS].explosivePermits;
export default explosivePermitReducerObject;
