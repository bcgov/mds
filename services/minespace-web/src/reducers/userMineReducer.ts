import * as actionTypes from "@/constants/actionTypes";
import { USER_MINE_INFO } from "@/constants/reducerTypes";
import { IMine, IMineDocument, IPageData } from "@mds/common";
import { RootState } from "@mds/common/redux/rootState";

/**
 * @file userMineReducer.js
 * all data associated with user mine records is handled within this reducer.
 */

interface IUserMineReducer {
  userMineInfo: IPageData<IMine>;
  mineDocuments: IMineDocument[];
  mine: IMine;
}

const initialState: IUserMineReducer = {
  userMineInfo: {
    records: [],
    current_page: 0,
    items_per_page: 0,
    total: 0,
    total_pages: 0,
  },
  mineDocuments: [],
  mine: null,
};

const userMineReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_USER_MINE_INFO:
      return {
        ...state,
        userMineInfo: action.payload,
      };
    case actionTypes.STORE_MINE_DOCUMENTS:
      return {
        ...state,
        mineDocuments: action.payload.records,
      };
    case actionTypes.STORE_MINE:
      return {
        ...state,
        mine: action.payload,
      };
    case actionTypes.CLEAR:
      return {
        userMineInfo: null,
      };
    default:
      return state;
  }
};

export const getUserMinePageData = (state: RootState) => state[USER_MINE_INFO].userMineInfo;
export const getMineDocuments = (state: RootState) => state[USER_MINE_INFO].mineDocuments;

export default userMineReducer;
