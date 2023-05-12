import { RootState } from "@/App";
import * as actionTypes from "../constants/actionTypes";
import { MINES } from "../constants/reducerTypes";
import { createItemMap, createItemIdsArray } from "../utils/helpers";
import { IMine, IMineComment, IMineDocument } from "@mds/common";
/**
 * @file mineReducer.js
 * all data associated with new mine/existing mine records is handled witnin this reducer.
 */
interface MineState {
  mines: IMine;
  mineIds: string[];
  mineNameList: IMine[];
  minesPageData: IMine;
  mineGuid: boolean;
  mineBasicInfoList: IMine[];
  mineDocuments: IMineDocument[];
  subscribedMines: IMine[];
  mineComments: IMineComment[];
  currentUserVerifiedMines: any[];
  currentUserUnverifiedMinesMines: any[];
}

const initialState: MineState = {
  mines: {},
  mineIds: [],
  mineNameList: [],
  minesPageData: {},
  mineGuid: false,
  mineBasicInfoList: [],
  mineDocuments: [],
  subscribedMines: [],
  mineComments: [],
  currentUserVerifiedMines: [],
  currentUserUnverifiedMinesMines: [],
};

export const mineReducer = (state: MineState = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_MINE_LIST:
      return {
        ...state,
        mines: createItemMap(action.payload.mines, "mine_guid"),
        mineIds: createItemIdsArray(action.payload.mines, "mine_guid"),
        minesPageData: action.payload,
        mineGuid: false,
      };
    case actionTypes.STORE_MINE:
      return {
        ...state,
        mines: createItemMap([action.payload], "mine_guid"),
        mineIds: createItemIdsArray([action.payload], "mine_guid"),
        mineGuid: action.id,
      };
    case actionTypes.STORE_MINE_NAME_LIST:
      return {
        ...state,
        mineNameList: action.payload.mines,
      };
    case actionTypes.STORE_MINE_BASIC_INFO_LIST:
      return {
        ...state,
        mineBasicInfoList: action.payload,
      };
    case actionTypes.STORE_MINE_DOCUMENTS:
      return {
        ...state,
        mineDocuments: action.payload.records,
      };
    case actionTypes.STORE_SUBSCRIBED_MINES:
      return {
        ...state,
        subscribedMines: action.payload.mines,
      };
    case actionTypes.STORE_CURRENT_USER_MINE_VERIFIED_STATUS:
      return {
        ...state,
        currentUserVerifiedMines: action.payload.filter((status) => status.healthy_ind === true),
        currentUserUnverifiedMinesMines: action.payload.filter(
          (status) => status.healthy_ind !== true
        ),
      };
    case actionTypes.STORE_MINE_COMMENTS:
      return {
        ...state,
        mineComments: action.payload.records,
      };
    default:
      return state;
  }
};

const mineReducerObject = {
  [MINES]: mineReducer,
};

export const getMines = (state: RootState): IMine => state[MINES].mines;
export const getMineIds = (state: RootState): string[] => state[MINES].mineIds;
export const getMineNames = (state: RootState): IMine[] => state[MINES].mineNameList;
export const getMinesPageData = (state: RootState): IMine => state[MINES].minesPageData;
export const getMineGuid = (state: RootState): string => state[MINES].mineGuid;
export const getMineBasicInfoList = (state: RootState): IMine[] => state[MINES].mineBasicInfoList;
export const getMineDocuments = (state: RootState): IMineDocument[] => state[MINES].mineDocuments;
export const getSubscribedMines = (state: RootState): IMine[] => state[MINES].subscribedMines;
export const getCurrentUserVerifiedMines = (state: RootState): any[] =>
  state[MINES].currentUserVerifiedMines;
export const getCurrentUserUnverifiedMines = (state: RootState): any[] =>
  state[MINES].currentUserUnverifiedMinesMines;
export const getMineComments = (state: RootState): IMineComment[] => state[MINES].mineComments;

export default mineReducerObject;
