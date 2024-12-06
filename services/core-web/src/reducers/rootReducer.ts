import mineAlertReducer from "./mineAlertReducer";
import { sharedReducer } from "@mds/common/redux/reducers/rootReducerShared";
import documentReducer from "./documentReducer";

const coreReducer = {
  ...sharedReducer,
  ...mineAlertReducer,
  ...documentReducer,
};

export const rootReducer = coreReducer;
