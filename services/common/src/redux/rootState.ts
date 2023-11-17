import { sharedReducer } from "@mds/common/redux/reducers/rootReducerShared";

import { createStore, applyMiddleware, combineReducers, $CombinedState } from "redux";
import thunk from "redux-thunk";
import { loadingBarMiddleware } from "react-redux-loading-bar";

const configureStore = () => {
  if (process.env.NODE_ENV === "development") {
    return createStore(
      combineReducers(sharedReducer),
      applyMiddleware(
        thunk,
        loadingBarMiddleware({
          scope: "modal",
        })
      )
    );
  }
  return createStore(
    combineReducers(sharedReducer),
    applyMiddleware(thunk, loadingBarMiddleware())
  );
};

const store = configureStore();

type RootState = ReturnType<typeof store.getState>;

export { RootState };
