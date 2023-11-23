import { combineReducers } from "redux";
import userMineReducer from "@/reducers/userMineReducer";
import networkReducer from "./networkReducer";
import * as reducerTypes from "../constants/reducerTypes";
import { createReducer } from "@common/utils/helpers";
import { sharedReducer } from "@mds/common/redux/reducers/rootReducerShared";

const minespaceReducer = {
  ...sharedReducer,
  [reducerTypes.USER_MINE_INFO]: userMineReducer,
  [reducerTypes.GET_USER_MINE_INFO]: createReducer(networkReducer, reducerTypes.GET_USER_MINE_INFO),
  [reducerTypes.AUTHENTICATE_USER]: createReducer(networkReducer, reducerTypes.AUTHENTICATE_USER),
  [reducerTypes.GET_USER_INFO]: createReducer(networkReducer, reducerTypes.GET_USER_INFO),
};

export const rootReducer = combineReducers(minespaceReducer);
