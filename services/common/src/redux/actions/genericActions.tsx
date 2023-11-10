import * as ActionTypes from "../constants/actionTypes";

export const success = (reducer, data = null) => ({
  name: reducer,
  type: ActionTypes.SUCCESS,
  data,
});

export const request = (reducer) => ({
  name: reducer,
  type: ActionTypes.REQUEST,
});

export interface IDispatchError {
  name: any;
  type: string;
  errorMessage: string;
}

export const error = (reducer, err = null): IDispatchError => ({
  name: reducer,
  type: ActionTypes.ERROR,
  errorMessage: err,
});

export const clear = (reducer) => ({
  name: reducer,
  type: ActionTypes.CLEAR,
});
