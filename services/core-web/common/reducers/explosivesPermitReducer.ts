import * as actionTypes from "../constants/actionTypes";
import { EXPLOSIVES_PERMITS } from "../constants/reducerTypes";
import { IExplosivesPermit } from "@mds/common";
import { RootState } from "@/App";

interface IExplosivesPermitReducerState {
  explosivesPermits: IExplosivesPermit[];
}

const initialState: IExplosivesPermitReducerState = {
  explosivesPermits: [],
};

export const explosivesPermitReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_EXPLOSIVES_PERMITS:
      return {
        ...state,
        explosivesPermits: action.payload.records,
      };
    default:
      return state;
  }
};

const explosivesPermitReducerObject = {
  [EXPLOSIVES_PERMITS]: explosivesPermitReducer,
};

export const getExplosivesPermits = (state: RootState) =>
  state[EXPLOSIVES_PERMITS].explosivesPermits;
export default explosivesPermitReducerObject;
