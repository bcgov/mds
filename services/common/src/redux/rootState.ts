import { sharedReducer } from "@mds/common/redux/reducers/rootReducerShared";
import { configureStore, Dispatch, UnknownAction } from "@reduxjs/toolkit";
import { loadingBarReducer } from "react-redux-loading-bar";

import type { TypedUseSelectorHook } from 'react-redux'
import { useDispatch, useSelector, useStore } from 'react-redux'
import type { FormAction } from 'redux-form';

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

/**
 * Provide typed versions for global redux functions
**/

type RootState = ReturnType<typeof store.getState>;

type AppAction = UnknownAction | FormAction;

// Infer the `RootState` and `AppDispatch` types from the store itself + make sure redux-form acti are captured as well.
export type AppDispatch = typeof store.dispatch & Dispatch<AppAction>;
export type AppStore = typeof store;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppStore: () => AppStore = useStore;


export { RootState };
