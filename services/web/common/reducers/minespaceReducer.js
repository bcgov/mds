import * as actionTypes from "../constants/actionTypes";
import { MINESPACE } from "../constants/reducerTypes";

const initialState = {
  minespaceUsers: [],
  minespaceUserMines: [],
};

export const minespaceReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_MINESPACE_USERS:
      return {
        ...state,
        minespaceUsers: action.payload.records,
      };
    case actionTypes.STORE_MINESPACE_USER_MINES:
      return {
        ...state,
        minespaceUserMines: action.payload,
      };
    default:
      return state;
  }
};

const minespaceReducerObject = {
  [MINESPACE]: minespaceReducer,
};

export const getMinespaceUsers = (state) => state[MINESPACE].minespaceUsers;
export const getMinespaceUserMines = (state) => state[MINESPACE].minespaceUserMines;

export default minespaceReducerObject;
