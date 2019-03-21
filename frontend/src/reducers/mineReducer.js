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
  mineBasicInfoList: [],
  mineDocuments: [],
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
    case actionTypes.STORE_MINE_BASIC_INFO_LIST:
      return {
        ...state,
        mineBasicInfoList: action.payload,
      };
    case actionTypes.STORE_MINE_DOCUMENTS:
      return {
        ...state,
        mineDocuments: action.payload.mine_documents,
      };
    case actionTypes.STORE_MINE_VERIFIED_STATUS:
      return {
        ...state,
        healthyMines: action.payload.healthy,
        unhealthyMines: action.payload.unhealthy,
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
export const getMineBasicInfoList = (state) => state[MINES].mineBasicInfoList;
export const getMineDocuments = (state) => state[MINES].mineDocuments;
export const getHealthyMines = (state) => state[MINES].healthyMines;
export const getUnhealthyMines = (state) => state[MINES].unhealthyMines;

export default mineReducer;
