import * as actionTypes from "../constants/actionTypes";
import { CORE_ACTIVITIES } from "../constants/reducerTypes";

const initialState = {
  coreActivities: [],
  userCoreActivities: [],
};

export const activityReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_CORE_ACTIVITIES:
      return {
        ...state,
        coreActivities: action.payload.records,
      };
    case actionTypes.STORE_USER_CORE_ACTIVITIES:
      return {
        ...state,
        userCoreActivities: action.payload.records,
      };
    default:
      return state;
  }
};

const activityReducerObject = {
  [CORE_ACTIVITIES]: activityReducer,
};

export const getCoreActivities = (state) => state[CORE_ACTIVITIES].coreActivities;
export const getUserCoreActivities = (state) => state[CORE_ACTIVITIES].userCoreActivities;

export default activityReducerObject;
