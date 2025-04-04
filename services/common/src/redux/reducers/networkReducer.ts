import { REQUEST, SUCCESS, ERROR } from "@mds/common/constants/actionTypes";
import { RootState } from "../rootState";
import { NetworkReducerTypes } from "@mds/common/constants/networkReducerTypes";

interface NetworkReducerState {
  isFetching: boolean;
  isSuccessful: boolean;
  error: boolean | string;
  requestType: any;
}

const initialState: NetworkReducerState = {
  isFetching: false,
  isSuccessful: false,
  error: null,
  requestType: null,
};

export const networkReducer = (state = initialState, action): NetworkReducerState => {
  switch (action.type) {
    case REQUEST:
      return {
        ...state,
        isFetching: true,
        isSuccessful: false,
        error: null,
        requestType: action.type,
      };
    case SUCCESS:
      return {
        ...state,
        isFetching: false,
        isSuccessful: true,
        error: false,
        requestType: action.type,
      };
    case ERROR:
      return {
        ...state,
        isFetching: false,
        isSuccessful: false,
        error: action.errorMessage,
        requestType: action.type,
      };
    default:
      return state;
  }
};

export const getIsFetching = (reducerType: NetworkReducerTypes) =>
  (state: RootState) => {
    return state[NetworkReducerTypes[reducerType]].isFetching;
  }

export default networkReducer;
