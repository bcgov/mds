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

export const storePartyRelationships = (payload, mine_tailings_storage_facility_guid = null) => ({
  type: ActionTypes.STORE_PARTY_RELATIONSHIPS,
  payload,
  mine_tailings_storage_facility_guid,
});

export const storeAllPartyRelationships = (payload) => ({
  type: ActionTypes.STORE_ALL_PARTY_RELATIONSHIPS,
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

export const storeProjectLeads = (payload) => ({
  type: ActionTypes.STORE_PROJECT_LEADS,
  payload,
});
