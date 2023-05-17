import { TAILINGS } from "../constants/reducerTypes";
import * as actionTypes from "../constants/actionTypes";
import { ITailingsStorageFacility } from "@mds/common";
import { RootState } from "@/App";

interface TailingsState {
  tsf: ITailingsStorageFacility;
}

const initialState: TailingsState = {
  tsf: {},
};

export const tailingsReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_TAILINGS_STORAGE_FACILITY:
      return {
        ...state,
        tsf: action.payload,
      };
    case actionTypes.CLEAR_TAILINGS_STORAGE_FACILITY:
      return {
        ...state,
        tsf: {},
      };
    default:
      return state;
  }
};

const tailingsReducerObject = {
  [TAILINGS]: tailingsReducer,
};

export const getTsf = (state: RootState) => state[TAILINGS].tsf;

export default tailingsReducerObject;
