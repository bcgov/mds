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

export const storePartyRelationships = (payload) => ({
  type: ActionTypes.STORE_PARTY_RELATIONSHIPS,
  payload,
});

export const storeAddPartyFormState = (payload) => ({
  type: ActionTypes.STORE_ADD_PARTY_FORM_STATE,
  payload,
});

export const storeLastCreatedParty = (payload) => ({
  type: ActionTypes.STORE_LAST_CREATED_PARTY,
  payload,
});

export const storeInspectors = (payload) => ({
  type: ActionTypes.STORE_INSPECTORS,
  payload,
});
