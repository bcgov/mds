import { buildCreateSlice, asyncThunkCreator } from "@reduxjs/toolkit";

// https://redux-toolkit.js.org/api/createslice#createasyncthunk
export const createAppSlice = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});
