import React from "react";
import { Provider } from "react-redux";
import getStore from "@/store/configureStore";
import { defaultState } from "@mds/common/tests/utils/ReduxWrapper";

// will provide child components with access to redux store,
// and the opportunity to pass in values for an initial state
export const ReduxWrapper = ({ children, initialState }) => {
  const store = getStore(initialState ?? defaultState);
  return <Provider store={store}>{children}</Provider>;
};
