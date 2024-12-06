import userMineReducer from "@/reducers/userMineReducer";
import { USER_MINE_INFO } from "@/constants/reducerTypes";
import { sharedReducer } from "@mds/common/redux/reducers/rootReducerShared";

const minespaceReducer = {
  ...sharedReducer,
  [USER_MINE_INFO]: userMineReducer,
};

export const rootReducer = minespaceReducer;
