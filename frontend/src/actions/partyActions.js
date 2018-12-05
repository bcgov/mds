import * as ActionTypes from "../constants/actionTypes";

export const storeParties = (payload) => ({
  type: ActionTypes.STORE_PARTIES,
  payload,
});

export const storeParty = (payload, id) => ({
  type: ActionTypes.STORE_PARTY,
  payload,
  id,
});

export const storePartyRelationshipTypes = (payload) => ({
  type: ActionTypes.STORE_PARTY_RELATIONSHIP_TYPES,
  payload,
});
