import { rootReducer } from "./reducers/rootReducer";
import * as testActionCreator from "./actionCreator/testActionCreator";
import * as testSelector from "./selectors/testSelectors";

const testRootReducer = rootReducer;
const testReducerPackage = {
  testSelector,
  testActionCreator,
  testRootReducer
};

export default testReducerPackage;
