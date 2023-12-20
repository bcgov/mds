import React from "react";
import { Provider } from "react-redux";
import getStore from "@/store/configureStore";

// will provide child components with access to redux store,
// and the opportunity to pass in values for an initial state
export const ReduxWrapper = ({ children, initialState = null }) => {
  const store = getStore(initialState);
  return <Provider store={store}>{children}</Provider>;
};
