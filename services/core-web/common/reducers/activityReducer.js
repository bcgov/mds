import { actionTypes } from "redux-form";
import { ACTIVITIES } from "../constants/reducerTypes";

const initialState = {
  activities: [],
};

export const activityReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_ACTIVITIES:
      return {
        ...state,
        activities: action.payload.records,
      };
    default:
      return state;
  }
};

const activityReducerObject = {
  [ACTIVITIES]: activityReducer,
};

export const getActivities = (state) => state[ACTIVITIES].activities;

export default activityReducerObject;
