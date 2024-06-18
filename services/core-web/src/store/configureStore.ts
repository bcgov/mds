import { loadingBarReducer } from "react-redux-loading-bar";
import { rootReducer } from "@/reducers/rootReducer";
import { configureStore } from "@reduxjs/toolkit";

const getStore = (preloadedState = {}) =>
  configureStore({
    reducer: {
      ...rootReducer,
      loadingBar: loadingBarReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        // Disable check for immutable state as this has caused a lot of errors with the redux-toolkit introduction
        // TODO: Consider fixing these issues and re-enabling this check
        // https://stackoverflow.com/questions/64695464/error-invariant-failed-a-state-mutation-was-detected-between-dispatches-in-th
        immutableCheck: false,
        serializableCheck: false,
      }),
    preloadedState,
    devTools: process.env.NODE_ENV === "development",
  });
export default getStore;
