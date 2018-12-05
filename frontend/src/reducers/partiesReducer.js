import * as actionTypes from "@/constants/actionTypes";
import { PARTIES } from "@/constants/reducerTypes";
import { createItemMap, createItemIdsArray } from "@/utils/helpers";

/**
 * @file partiesReducer.js
 * all data associated with parties is handled witnin this reducer.
 */

const initialState = {
  parties: {},
  partyIds: [],
  partyRelationshipTypes: [],
};

const partiesReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_PARTIES:
      return {
        ...state,
        parties: createItemMap(action.payload.parties, "party_guid"),
        partyIds: createItemIdsArray(action.payload.parties, "party_guid"),
      };
    case actionTypes.STORE_PARTY:
      return {
        ...state,
        parties: createItemMap([action.payload], "party_guid"),
        partyIds: createItemIdsArray([action.payload], "party_guid"),
      };
    case actionTypes.STORE_PARTY_RELATIONSHIP_TYPES:
      return {
        ...state,
        partyRelationshipTypes: action.payload,
      };
    default:
      return state;
  }
};

export const getParties = (state) => state[PARTIES].parties;
export const getPartyIds = (state) => state[PARTIES].partyIds;
export const getPartyRelationshipTypes = (state) => state[PARTIES].partyRelationshipTypes;

export default partiesReducer;
