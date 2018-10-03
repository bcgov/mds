import * as actionTypes from '@/constants/actionTypes';
import { MINES } from '@/constants/reducerTypes';

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
};

const createItemMap = (array, idField) => {
  return array.reduce((result, item) => {
    result[item[idField]] = item;
    return result;
  }, {});
};

const renderCurrentPermittee = (array, path) => {
  const permitteeObj = {};
  array.map((permit) => {
    permitteeObj[permit[path]] = permit.permittee[0];
  })
  return permitteeObj;
 }

 const renderCurrentPermitteeIds = (array, path) => {
  const permitteeIds = [];
  let unique;
  array.map((permit) => {
    permitteeIds.push(permit[path]);
  })
  unique = [...new Set(permitteeIds)];
  return unique;
 }

const createItemIdsArray = (array, idField) => {
  return array.map(item => item[idField]);
};

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
          permittees: renderCurrentPermittee(action.payload.mine_permit, 'permittee[0].party_guid'),
          permitteeIds: renderCurrentPermitteeIds(action.payload.mine_permit, 'permittee[0].party_guid')
        }
      case actionTypes.STORE_MINE_NAME_LIST:
        return {
          ...state,
          mineNameList: action.payload,
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

export default mineReducer;