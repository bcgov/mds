import * as ActionTypes from '../constants/actionTypes';

export const addMine = (name) => {
    return {
      type: ActionTypes.ADD_MINE,
      name: name,
    }
  }