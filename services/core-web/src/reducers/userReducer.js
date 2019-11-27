import * as actionTypes from "@/constants/actionTypes";
import { USERS } from "@/constants/reducerTypes";

const initialState = {
  coreUsers: [],
};

const userReducer = (state = initialState, action) => {
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

export const getCoreUsers = (state) => state[USERS].coreUsers;

export default userReducer;
