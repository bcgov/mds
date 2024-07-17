import { buildCreateSlice, asyncThunkCreator } from "@reduxjs/toolkit";

// https://redux-toolkit.js.org/api/createslice#createasyncthunk
export const createAppSlice = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

export const rejectHandler = (action) => {
  console.log(action.error);
  console.log(action.error.stack);
};
