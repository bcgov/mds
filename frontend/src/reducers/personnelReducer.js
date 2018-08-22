import * as actionTypes from '@/constants/actionTypes';
import { PERSONNEL } from '@/constants/reducerTypes';

/**
 * @file mineReducer.js
 * all data associated with new mine/existing mine records is handled witnin this reducer.
 */

const initialState = {
  personnel: {},
  personnelIds: [],
};

const createItemMap = (array, idField) => {
  return array.reduce((result, item) => {
    result[item[idField]] = item;
    return result;
  }, {});
};

const createItemIdsArray = (array, idField) => {
  return array.map(item => item[idField]);
};

const personnelReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_PERSONNEL_LIST:
      return {
        ...state,
        personnel: createItemMap(action.payload.persons, 'person_guid'),
        personnelIds: createItemIdsArray(action.payload.persons, 'person_guid'),
      }
    case actionTypes.STORE_PERSONNEL:
      return {
        ...state,
        personnel: createItemMap([action.payload], 'person_guid'),
        personnelIds: createItemIdsArray([action.payload], 'person_guid'),
      }
    default:
      return state;
  }
};

export const getPersonnel = (state) => state[PERSONNEL].personnel;
export const getPersonnelIds = (state) => state[PERSONNEL].personnelIds;

export default personnelReducer;