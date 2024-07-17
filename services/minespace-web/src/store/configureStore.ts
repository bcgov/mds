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
        serializableCheck: false,
      }),
    preloadedState,
    devTools: process.env.NODE_ENV === "development",
  });
export default getStore;
