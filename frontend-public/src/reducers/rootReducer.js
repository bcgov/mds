import { combineReducers } from "redux";
import { reducer as formReducer } from "redux-form";
import { loadingBarReducer } from "react-redux-loading-bar";
import networkReducer from "./networkReducer";
import * as reducerTypes from "@/constants/reducerTypes";
import authenticationReducer from "@/reducers/authenticationReducer";
import userMineInfoReducer from "@/reducers/userMineInfoReducer";

// Function to create a reusable reducer (used in src/reducers/rootReducer)
export const createReducer = (reducer, name) => (state, action) => {
  if (name !== action.name && state !== undefined) {
    return state;
  }
  return reducer(state, action);
};

export const reducerObject = {
  form: formReducer,
  loadingBar: loadingBarReducer,
  [reducerTypes.AUTHENTICATION]: authenticationReducer,
  [reducerTypes.USER_MINE_INFO]: userMineInfoReducer,
  [reducerTypes.GET_USER_MINE_INFO]: createReducer(networkReducer, reducerTypes.GET_USER_MINE_INFO),
};

export const rootReducer = combineReducers(reducerObject);
