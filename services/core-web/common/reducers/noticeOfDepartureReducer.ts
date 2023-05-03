import { INoticeOfDeparture } from "@mds/common";
import * as actionTypes from "../constants/actionTypes";
import { NOTICES_OF_DEPARTURE } from "../constants/reducerTypes";

interface NoDState {
  nods: INoticeOfDeparture[];
  noticeOfDeparture: INoticeOfDeparture | NonNullable<unknown>;
}

const initialState: NoDState = {
  nods: [],
  noticeOfDeparture: {},
};

export const noticeOfDepartureReducer = (state: NoDState = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_NOTICES_OF_DEPARTURE:
      return {
        ...state,
        nods: action.payload.records,
      };
    case actionTypes.STORE_NOTICE_OF_DEPARTURE:
      return {
        ...state,
        noticeOfDeparture: action.payload,
      };
    default:
      return state;
  }
};

const noticeOfDepartureReducerObject = {
  [NOTICES_OF_DEPARTURE]: noticeOfDepartureReducer,
};

export const getNoticesOfDeparture = (state): INoticeOfDeparture[] =>
  state[NOTICES_OF_DEPARTURE].nods;
export const getNoticeOfDeparture = (state): INoticeOfDeparture =>
  state[NOTICES_OF_DEPARTURE].noticeOfDeparture;

export default noticeOfDepartureReducerObject;
