import * as actionTypes from "@/constants/actionTypes";
import { MINESPACE } from "@/constants/reducerTypes";

const initialState = {
  minespaceUsers: [],
  minespaceUserMines: [],
};

const minespaceReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_MINESPACE_USERS:
      return {
        ...state,
        minespaceUsers: action.payload.users,
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

export const getMinespaceUsers = (state) => state[MINESPACE].minespaceUsers;
export const getMinespaceUserMines = (state) => state[MINESPACE].minespaceUserMines;

export default minespaceReducer;
