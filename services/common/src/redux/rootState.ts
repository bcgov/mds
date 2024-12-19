import { sharedReducer } from "@mds/common/redux/reducers/rootReducerShared";
import { configureStore } from "@reduxjs/toolkit";
import { loadingBarReducer } from "react-redux-loading-bar";

import type { TypedUseSelectorHook } from 'react-redux'
import { useDispatch, useSelector, useStore } from 'react-redux'

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

// Provide typed versions for global redux functions
type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppStore: () => AppStore = useStore;


export { RootState };
