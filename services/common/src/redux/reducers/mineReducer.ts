import { RootState } from "@mds/common/redux/rootState";
import * as actionTypes from "@mds/common/constants/actionTypes";
import { MINES } from "@mds/common/constants/reducerTypes";
import { createItemMap, createItemIdsArray } from "../utils/helpers";
import { IMine, IMineComment, IMineDocument, ItemMap } from "@mds/common/interfaces";
/**
 * @file mineReducer.js
 * all data associated with new mine/existing mine records is handled witnin this reducer.
 */
interface MineState {
  mines: ItemMap<IMine>;
  mineIds: string[];
  mineNameList: IMine[];
  minesPageData: IMine;
  mineGuid: string;
  mineBasicInfoList: IMine[];
  mineDocuments: IMineDocument[];
  subscribedMines: { records: IMine[]; loaded: boolean };
  mineComments: IMineComment[];
  currentUserVerifiedMines: IMine[];
  currentUserUnverifiedMinesMines: IMine[];
}

const initialState: MineState = {
  mines: {} as ItemMap<IMine>,
  mineIds: [],
  mineNameList: [],
  minesPageData: {} as IMine,
  mineGuid: "",
  mineBasicInfoList: [],
  mineDocuments: [],
  subscribedMines: { records: [], loaded: false },
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
        mineGuid: "",
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
        subscribedMines: { records: action.payload.mines, loaded: true },
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

export const getMines = (state: RootState): ItemMap<IMine> => state[MINES].mines as ItemMap<IMine>;
export const getMineById = (state: RootState, mineGuid: string): IMine =>
  state[MINES]?.mines[mineGuid] as IMine;
export const getMineIds = (state: RootState): string[] => state[MINES].mineIds;
export const getMineNames = (state: RootState): IMine[] => state[MINES].mineNameList;
export const getMinesPageData = (state: RootState): IMine => state[MINES].minesPageData;
export const getMineGuid = (state: RootState): any => state[MINES].mineGuid;
export const getMineBasicInfoList = (state: RootState): IMine[] => state[MINES].mineBasicInfoList;
export const getMineDocuments = (state: RootState): IMineDocument[] => state[MINES].mineDocuments;
export const getSubscribedMines = (state: RootState): { records: IMine[]; loaded: boolean } =>
  state[MINES].subscribedMines;
export const getCurrentUserVerifiedMines = (state: RootState): IMine[] =>
  state[MINES].currentUserVerifiedMines;
export const getCurrentUserUnverifiedMines = (state: RootState): IMine[] =>
  state[MINES].currentUserUnverifiedMinesMines;
export const getMineComments = (state: RootState): IMineComment[] => state[MINES].mineComments;

export default mineReducerObject;
