import * as actionTypes from "../constants/actionTypes";
import { MINES } from "../constants/reducerTypes";
import { createItemMap, createItemIdsArray } from "../utils/helpers";

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
  subscribedMines: [],
  mineComments: [],
  mineAlerts: [],
  mineAlert: {},
};

export const mineReducer = (state = initialState, action) => {
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
    case actionTypes.STORE_MINE_ALERTS:
      return {
        ...state,
        mineAlerts: action.payload.records,
      };
    case actionTypes.STORE_MINE_ALERT:
      return {
        ...state,
        mineAlert: action.payload,
      }
    default:
      return state;
  }
};

const mineReducerObject = {
  [MINES]: mineReducer,
};

export const getMines = (state) => state[MINES].mines;
export const getMineIds = (state) => state[MINES].mineIds;
export const getMineNames = (state) => state[MINES].mineNameList;
export const getMinesPageData = (state) => state[MINES].minesPageData;
export const getMineGuid = (state) => state[MINES].mineGuid;
export const getMineBasicInfoList = (state) => state[MINES].mineBasicInfoList;
export const getMineDocuments = (state) => state[MINES].mineDocuments;
export const getSubscribedMines = (state) => state[MINES].subscribedMines;
export const getCurrentUserVerifiedMines = (state) => state[MINES].currentUserVerifiedMines;
export const getCurrentUserUnverifiedMines = (state) =>
  state[MINES].currentUserUnverifiedMinesMines;
export const getMineComments = (state) => state[MINES].mineComments;
export const getMineAlert = (state) => state[MINES].mineAlert;
export const getMineAlerts = (state) => state[MINES].mineAlerts;

export default mineReducerObject;
