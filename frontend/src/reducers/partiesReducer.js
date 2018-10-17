import * as actionTypes from '@/constants/actionTypes';
import { PARTIES } from '@/constants/reducerTypes';
import { createItemMap, createItemIdsArray } from '@/utils/helpers';

/**
 * @file partiesReducer.js
 * all data associated with parties is handled witnin this reducer.
 */

const initialState = {
  parties: {},
  partyIds: [],
};

const partiesReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_PARTIES:
      return {
        ...state,
        parties: createItemMap(action.payload.parties, 'party_guid'),
        partyIds: createItemIdsArray(action.payload.parties, 'party_guid'),
      }
    case actionTypes.STORE_PARTY:
      return {
        ...state,
        parties: createItemMap([action.payload], 'party_guid'),
        partyIds: createItemIdsArray([action.payload], 'party_guid'),
      }
    default:
      return state;
  }
};

export const getParties = (state) => state[PARTIES].parties;
export const getPartyIds = (state) => state[PARTIES].partyIds;

export default partiesReducer;