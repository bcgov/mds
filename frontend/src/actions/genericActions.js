import * as ActionTypes from "../constants/actionTypes";

export const success = (reducer, data) => ({
  name: reducer,
  type: ActionTypes.SUCCESS,
  data,
});

export const request = (reducer) => ({
  name: reducer,
  type: ActionTypes.REQUEST,
});

export const error = (reducer, err) => ({
  name: reducer,
  type: ActionTypes.ERROR,
  errorMessage: err,
});

export const clear = (reducer) => ({
  name: reducer,
  type: ActionTypes.CLEAR,
});
