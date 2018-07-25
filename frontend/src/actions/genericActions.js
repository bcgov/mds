import * as ActionTypes from '../constants/actionTypes';

export const success = (reducer, data) => {
  return {
    name: reducer,
    type: ActionTypes.SUCCESS,
    data: data,
  }
}

export const request = (reducer) => {
  return {
    name: reducer,
    type: ActionTypes.REQUEST,
  }
}

export const error = (reducer, error) => {
  return {
    name: reducer,
    type: ActionTypes.ERROR,
    errorMessage: error,
  }
}
