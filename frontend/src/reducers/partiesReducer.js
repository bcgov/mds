import * as actionTypes from "@/constants/actionTypes";
import { PARTIES } from "@/constants/reducerTypes";
import { createItemMap, createItemIdsArray, createDropDownList } from "@/utils/helpers";

/**
 * @file partiesReducer.js
 * all data associated with parties is handled witnin this reducer.
 */

const initialState = {
  parties: {},
  rawParties: {},
  partyIds: [],
  partyRelationshipTypes: [],
  partyRelationships: [],
  partyPageData: {},
};

const partiesReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_PARTIES:
      return {
        ...state,
        rawParties: action.payload.parties,
        parties: createItemMap(action.payload.parties, "party_guid"),
        partyIds: createItemIdsArray(action.payload.parties, "party_guid"),
        partyPageData: action.payload,
      };
    case actionTypes.STORE_PARTY:
      return {
        ...state,
        rawParties: [action.payload],
        parties: createItemMap([action.payload], "party_guid"),
        partyIds: createItemIdsArray([action.payload], "party_guid"),
      };
    case actionTypes.STORE_PARTY_RELATIONSHIP_TYPES:
      return {
        ...state,
        partyRelationshipTypes: action.payload,
      };
    case actionTypes.STORE_PARTY_RELATIONSHIPS:
      return {
        ...state,
        partyRelationships: action.payload,
      };
    default:
      return state;
  }
};

export const getParties = (state) => state[PARTIES].parties;
export const getRawParties = (state) => state[PARTIES].rawParties;
export const getPartyIds = (state) => state[PARTIES].partyIds;
export const getPartyRelationshipTypes = (state) => state[PARTIES].partyRelationshipTypes;
export const getPartyRelationshipTypesList = (state) =>
  createDropDownList(
    state[PARTIES].partyRelationshipTypes,
    "description",
    "mine_party_appt_type_code"
  );
export const getPartyRelationships = (state) => state[PARTIES].partyRelationships;
export const getPartyPageData = (state) => state[PARTIES].partyPageData;

export default partiesReducer;
