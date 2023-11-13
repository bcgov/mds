import * as actionTypes from "@mds/common/constants/actionTypes";
import { MINESPACE } from "@mds/common/constants/reducerTypes";

const initialState = {
  minespaceUsers: [],
  minespaceUserMines: [],
  EMLIContacts: [],
  EMLIContactsByRegion: [],
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
    case actionTypes.STORE_EMLI_CONTACTS:
      return {
        ...state,
        EMLIContacts: action.payload.records,
      };
    case actionTypes.STORE_EMLI_CONTACTS_BY_REGION:
      return {
        ...state,
        EMLIContactsByRegion: action.payload.records,
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
export const getEMLIContacts = (state) => state[MINESPACE].EMLIContacts;
export const getEMLIContactsByRegion = (state) => state[MINESPACE].EMLIContactsByRegion;

export default minespaceReducerObject;
