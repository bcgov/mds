import * as actionTypes from '@/constants/actionTypes';
import { MINES } from '@/constants/reducerTypes';
import { createItemMap, createItemIdsArray } from '@/utils/helpers';

/**
 * @file mineReducer.js
 * all data associated with new mine/existing mine records is handled witnin this reducer.
 */

const initialState = {
  mines: {},
  mineIds: [],
  mineNameList: [],
  minesPageData: {},
  permittees: {},
  permitteeIds: [],
  mineStatusOptions: []
};

const renderCurrentPermittee = (array) => {
  const permitteeObj = {};
  array.map((permit) => {
    permitteeObj[permit.permittee[0].party_guid] = permit.permittee[0];
  })
  return permitteeObj;
 }

 const renderCurrentPermitteeIds = (array) => {
  const permitteeIds = [];
  let unique;
  array.map((permit) => {
    permitteeIds.push(permit.permittee[0].party_guid);
  })
  unique = [...new Set(permitteeIds)];
  return unique;
 }

const mineReducer = (state = initialState, action) => {
    switch (action.type) {
      case actionTypes.STORE_MINE_LIST:
        return {
          ...state,
          mines: createItemMap(action.payload.mines, 'guid'),
          mineIds: createItemIdsArray(action.payload.mines, 'guid'),
          minesPageData: action.payload
        }
      case actionTypes.STORE_MINE:
        return {
          ...state,
          mines: createItemMap([action.payload], 'guid'),
          mineIds: createItemIdsArray([action.payload], 'guid'),
        }
        case actionTypes.STORE_CURRENT_PERMITTEES:
        return {
          ...state,
          permittees: renderCurrentPermittee(action.payload.mine_permit),
          permitteeIds: renderCurrentPermitteeIds(action.payload.mine_permit)
        }
      case actionTypes.STORE_MINE_NAME_LIST:
        return {
          ...state,
          mineNameList: action.payload,
        }
      case actionTypes.STORE_STATUS_OPTIONS:
        return {
          ...state,
          mineStatusOptions: action.payload.options,
        }
      case actionTypes.UPDATE_MINE_RECORD:
        return {
          ...state,
          mines: createItemMap([action.payload], 'guid'),
          mineIds: createItemIdsArray([action.payload], 'guid'),
        }
      default:
        return state;
    }
};

export const getMines = (state) => state[MINES].mines;
export const getMineIds = (state) => state[MINES].mineIds;
export const getMineNames = (state) => state[MINES].mineNameList;
export const getMinesPageData = (state) => state[MINES].minesPageData;
export const getCurrentPermittees = (state) => state[MINES].permittees;
export const getCurrentPermitteeIds = (state) => state[MINES].permitteeIds;
export const getMineStatusOptions = (state) => state[MINES].mineStatusOptions;

export default mineReducer;