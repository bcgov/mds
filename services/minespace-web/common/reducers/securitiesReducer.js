import * as actionTypes from "../constants/actionTypes";
import { SECURITIES } from "../constants/reducerTypes";

const initialState = {
  bonds: [],
};

export const securitiesReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_MINE_BONDS:
      return {
        ...state,
        bonds: action.payload.records,
      };
    default:
      return state;
  }
};

const securitiesReducerObject = {
  [SECURITIES]: securitiesReducer,
};

export const getBonds = (state) => state[SECURITIES].bonds;

export default securitiesReducerObject;
