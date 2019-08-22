import * as actionTypes from "@/constants/actionTypes";
import { INCIDENTS } from "@/constants/reducerTypes";

const initialState = {
  incidents: [],
  incidentPageData: {},
};

const incidentsReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_INCIDENTS:
      return {
        ...state,
        incidents: action.payload.records,
        incidentPageData: action.payload,
      };
    default:
      return state;
  }
};

export const getIncidents = (state) => state[INCIDENTS].incidents;
export const getIncidentPageData = (state) => state[INCIDENTS].incidentPageData;

export default incidentsReducer;
