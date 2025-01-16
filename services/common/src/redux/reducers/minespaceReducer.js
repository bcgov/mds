import * as actionTypes from "@mds/common/constants/actionTypes";
import { MINESPACE } from "@mds/common/constants/reducerTypes";

const initialState = {
  minespaceUsers: [],
  minespaceUserMines: [],
  MinistryContacts: [],
  MinistryContactsByRegion: [],
};

export const minespaceReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_MINESPACE_USERS:
      return {
        ...state,
        minespaceUsers: action.payload.records,
      };
    case actionTypes.STORE_MINESPACE_USER_MINES:
      return {
        ...state,
        minespaceUserMines: action.payload,
      };
    case actionTypes.STORE_MINISTRY_CONTACTS:
      return {
        ...state,
        MinistryContacts: action.payload.records,
      };
    case actionTypes.STORE_MINISTRY_CONTACTS_BY_REGION:
      return {
        ...state,
        MinistryContactsByRegion: action.payload.records,
      };
    default:
      return state;
  }
};

const minespaceReducerObject = {
  [MINESPACE]: minespaceReducer,
};

export const getMinespaceUsers = (state) => state[MINESPACE].minespaceUsers;
export const getMinespaceUserMines = (state) => state[MINESPACE].minespaceUserMines;
export const getMinistryContacts = (state) => state[MINESPACE].MinistryContacts;
export const getMinistryContactsByRegion = (state) => state[MINESPACE].MinistryContactsByRegion;

export default minespaceReducerObject;
