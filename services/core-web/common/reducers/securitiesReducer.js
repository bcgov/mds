import * as actionTypes from "../constants/actionTypes";
import { SECURITIES } from "../constants/reducerTypes";

const initialState = {
  bonds: [],
  bond: {},
};

export const securitiesReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_MINE_BONDS:
      return {
        ...state,
        bonds: action.payload.records,
      };
    case actionTypes.STORE_BOND:
      return {
        ...state,
        bond: action.payload,
      };
    default:
      return state;
  }
};

const securitiesReducerObject = {
  [SECURITIES]: securitiesReducer,
};

export const getBonds = (state) => state[SECURITIES].bonds;
export const getBond = (state) => state[SECURITIES].bond;

export default securitiesReducerObject;
