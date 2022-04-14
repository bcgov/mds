import * as actionTypes from "../constants/actionTypes";
import { NOTICES_OF_DEPARTURE } from "../constants/reducerTypes";

const initialState = {
  nods: [],
};

export const noticeOfDepartureReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_NOTICES_OF_DEPARTURE:
      return {
        ...state,
        nods: action.payload.records,
      };
    default:
      return state;
  }
};

const noticeOfDepartureReducerObject = {
  [NOTICES_OF_DEPARTURE]: noticeOfDepartureReducer,
};

export const getNoticesOfDeparture = (state) => state[NOTICES_OF_DEPARTURE].nods;

export default noticeOfDepartureReducerObject;
