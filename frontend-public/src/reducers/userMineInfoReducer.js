import * as actionTypes from "@/constants/actionTypes";
import { USER_MINE_INFO } from "@/constants/reducerTypes";

/**
 * @file userMineInfoReducer.js
 * all data associated with user mine records is handled witnin this reducer.
 */

const initialState = {
  userMineInfo: {},
  mine: {},
  expectedDocumentStatusOptions: [],
  mineDocuments: [],
};

const userMineInfoReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_USER_MINE_INFO:
      return {
        ...state,
        userMineInfo: action.payload,
      };
    case actionTypes.STORE_MINE:
      return {
        ...state,
        mine: action.payload,
      };
    case actionTypes.STORE_MINE_DOCUMENTS:
      return {
        ...state,
        mineDocuments: action.payload.mine_documents,
      };
    case actionTypes.CLEAR:
      return {
        userMineInfo: null,
      };
    default:
      return state;
  }
};

export const getUserMineInfo = (state) => state[USER_MINE_INFO].userMineInfo;
export const getMine = (state) => state[USER_MINE_INFO].mine;
export const getMineDocuments = (state) => state[USER_MINE_INFO].mineDocuments;

export default userMineInfoReducer;
