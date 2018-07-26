import * as reducerTypes from '../constants/reducerTypes';

const createMine = (state=[], action) => {
    switch (action.type) {
        case reducerTypes.CREATE_MINE_RECORD:
          return {
            ...state,
            name: action.mineName
          };
        default:
          return state;
      }
}

export default createMine;