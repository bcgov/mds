import { sharedReducer } from "@mds/common/redux/reducers/rootReducerShared";
import { configureStore } from "@reduxjs/toolkit";
import { loadingBarReducer } from "react-redux-loading-bar";

const getStore = (preloadedState = {}) =>
  configureStore({
    reducer: {
      ...sharedReducer,
      loadingBar: loadingBarReducer,
    },
    preloadedState,
    devTools: process.env.NODE_ENV === "development",
  });

export const store = getStore();

type RootState = ReturnType<typeof store.getState>;

export { RootState };
