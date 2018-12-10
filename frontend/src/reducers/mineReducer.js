import * as actionTypes from "@/constants/actionTypes";
import { MINES } from "@/constants/reducerTypes";
import { createItemMap, createItemIdsArray } from "@/utils/helpers";

/**
 * @file mineReducer.js
 * all data associated with new mine/existing mine records is handled witnin this reducer.
 */

const initialState = {
  mines: {},
  mineIds: [],
  mineNameList: [],
  minesPageData: {},
  mineGuid: false,
};

const mineReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_MINE_LIST:
      return {
        ...state,
        mines: createItemMap(action.payload.mines, "guid"),
        mineIds: createItemIdsArray(action.payload.mines, "guid"),
        minesPageData: action.payload,
        mineGuid: false,
      };
    case actionTypes.STORE_MINE:
      return {
        ...state,
        mines: createItemMap([action.payload], "guid"),
        mineIds: createItemIdsArray([action.payload], "guid"),
        mineGuid: action.id,
      };
    case actionTypes.STORE_MINE_NAME_LIST:
      return {
        ...state,
        mineNameList: action.payload,
      };
    default:
      return state;
  }
};

export const getMines = (state) => state[MINES].mines;
export const getMineIds = (state) => state[MINES].mineIds;
export const getMineNames = (state) => state[MINES].mineNameList;
export const getMinesPageData = (state) => state[MINES].minesPageData;
export const getMineGuid = (state) => state[MINES].mineGuid;

export default mineReducer;
