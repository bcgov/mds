import { combineReducers } from "redux";
import { loadingBarReducer } from "react-redux-loading-bar";
import * as reducerTypes from "../constants/reducerTypes";
import networkReducer from "./networkReducer";
import { createReducer } from "../utils/helpers";
import testReducer from "./testReducer";

export const reducerObject = {
  loadingBar: loadingBarReducer,
  [reducerTypes.TEST]: testReducer,
  [reducerTypes.GET_MINE_TEST_INFO]: createReducer(
    networkReducer,
    reducerTypes.GET_MINE_TEST_INFO
  )
};

export const rootReducer = combineReducers(reducerObject);
