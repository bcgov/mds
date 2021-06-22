import * as actionTypes from "../constants/actionTypes";
import { EXPLOSIVES_PERMITS } from "../constants/reducerTypes";

const initialState = {
  explosivePermits: [],
};

export const explosivesPermitReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_EXPLOSIVES_PERMITS:
      return {
        ...state,
        explosivePermits: action.payload.records,
      };
    default:
      return state;
  }
};

const explosivesPermitReducerObject = {
  [EXPLOSIVES_PERMITS]: explosivesPermitReducer,
};

export const getExplosivePermits = (state) => state[EXPLOSIVES_PERMITS].explosivePermits;
export default explosivesPermitReducerObject;
