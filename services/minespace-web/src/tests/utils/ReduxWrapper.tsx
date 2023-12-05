import React from "react";
import { applyMiddleware, createStore } from "redux";
import thunk from "redux-thunk";
import { loadingBarMiddleware } from "react-redux-loading-bar";
import { Provider } from "react-redux";
import { rootReducer } from "@/reducers/rootReducer";

// will provide child components with access to redux store,
// and the opportunity to pass in values for an initial state
export const ReduxWrapper = ({ children, initialState = null }) => {
  // type default is supplied so that switch(action.type) doesn't error,
  const store = createStore(
    () => rootReducer(initialState, { type: "default" }),
    applyMiddleware(thunk, loadingBarMiddleware())
  );
  return <Provider store={store}>{children}</Provider>;
};
