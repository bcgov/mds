import { RootState } from "@/App";
import * as actionTypes from "../constants/actionTypes";
import { ACTIVITIES } from "../constants/reducerTypes";
import { IActivity } from "@mds/common";

interface IActivityReducer {
  activities: IActivity[];
  totalActivities: number;
}

const initialState: IActivityReducer = {
  activities: [],
  totalActivities: null,
};

export const activityReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_ACTIVITIES:
      return {
        ...state,
        activities: action.payload.records,
        totalActivities: action.payload.total,
      };
    case actionTypes.CLEAR:
      return {
        activities: [],
        totalActivities: null,
      };
    default:
      return state;
  }
};

const activityReducerObject = {
  [ACTIVITIES]: activityReducer,
};

export const getActivities = (state: RootState) => state[ACTIVITIES].activities;
export const getTotalActivities = (state: RootState) => state[ACTIVITIES].totalActivities;

export default activityReducerObject;
