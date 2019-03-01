import * as actionTypes from "@/constants/actionTypes";
import { PERMITS } from "@/constants/reducerTypes";
import { createItemMap, createItemIdsArray, createDropDownList } from "@/utils/helpers";

const initialState = {
  permits: [],
};

const permitReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_PERMITS:
      return {
        ...state,
        permits: action.payload,
      };
    default:
      return state;
  }
};

export const getPermits = (state) => state[PERMITS].parties;

export default permitReducer;
