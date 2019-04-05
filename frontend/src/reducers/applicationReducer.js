import * as actionTypes from "@/constants/actionTypes";
import { APPLICATIONS } from "@/constants/reducerTypes";

const initialState = {
  applications: [],
};

const applicationReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_APPLICATIONS:
      return {
        ...state,
        applications: action.payload.applications,
      };
    default:
      return state;
  }
};

export const getApplications = (state) => state[APPLICATIONS].applications;

export default applicationReducer;
