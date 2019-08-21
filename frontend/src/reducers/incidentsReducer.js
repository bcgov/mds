import * as actionTypes from "@/constants/actionTypes";
import { INCIDENTS } from "@/constants/reducerTypes";

const initialState = {
  incidents: [],
  incidentsPageData: {},
};

const varianceReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_INCIDENTS:
      return {
        ...state,
        incidents: action.payload.records,
        incidentsPageData: action.payload,
      };
    default:
      return state;
  }
};

export const getIncidents = (state) => state[INCIDENTS].incidents;
export const getIncidentsPageData = (state) => state[INCIDENTS].incidentsPageData;

export default varianceReducer;
