import React from "react";
import { Provider } from "react-redux";
import { getStore } from "@mds/common/redux/rootState";
import { STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import { BULK_STATIC_CONTENT_RESPONSE } from "../mocks/dataMocks";

export const defaultState = {
  [STATIC_CONTENT]: BULK_STATIC_CONTENT_RESPONSE
};

// will provide child components with access to redux store,
// and the opportunity to pass in values for an initial state
export const ReduxWrapper = ({ children, initialState }) => {
  const store = getStore(initialState ?? defaultState);
  return <Provider store={store}>{children}</Provider>;
};
