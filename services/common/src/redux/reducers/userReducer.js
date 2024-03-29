import * as actionTypes from "@mds/common/constants/actionTypes";
import { USERS } from "@mds/common/constants/reducerTypes";

const initialState = {
  coreUsers: [],
};

export const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_CORE_USERS:
      return {
        ...state,
        coreUsers: action.payload.results,
      };
    default:
      return state;
  }
};

const userReducerObject = {
  [USERS]: userReducer,
};

export const getCoreUsers = (state) => state[USERS].coreUsers;

export default userReducerObject;
