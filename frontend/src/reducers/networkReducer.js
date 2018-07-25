/**
* @file networkReducer.js
* Data is no associated with this reducer, only the network
* request status.
*/
import { REQUEST, SUCCESS, ERROR } from '../constants/actionTypes';

const initialState = {
  isFetching: false,
  isSuccessful: false,
  error: null,
  requestType: null,
};

const genericRequest = (state = initialState, action) => {
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

export default genericRequest;
