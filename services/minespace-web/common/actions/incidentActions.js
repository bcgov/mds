import * as ActionTypes from "../constants/actionTypes";

export const storeIncidents = (payload) => ({
  type: ActionTypes.STORE_INCIDENTS,
  payload,
});

export const storeMineIncidents = (payload) => ({
  type: ActionTypes.STORE_MINE_INCIDENTS,
  payload,
});

export const storeMineIncidentNotes = (payload) => ({
  type: ActionTypes.STORE_MINE_INCIDENT_NOTES,
  payload,
});
