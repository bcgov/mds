import { sharedReducer } from "@mds/common/redux/reducers/rootReducerShared";
import { configureStore } from "@reduxjs/toolkit";
import { loadingBarReducer } from "react-redux-loading-bar";

export const getStore = (preloadedState = {}) =>
  configureStore({
    reducer: {
      ...sharedReducer,
      loadingBar: loadingBarReducer,
    },
    preloadedState,
    devTools: process.env.NODE_ENV === "development",
  });

export const store = getStore();

// @ts-ignore
type RootState = ReturnType<typeof store.getState>;

export { RootState };
