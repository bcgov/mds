import { createAppSlice, rejectHandler } from "@mds/common/redux/createAppSlice";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import CustomAxios from "@mds/common/redux/customAxios";
import { ItemMap } from "@mds/common/interfaces";
import { createSelector } from "@reduxjs/toolkit";
import { APP_HELP, ENVIRONMENT } from "@mds/common/constants";

const createRequestHeader = REQUEST_HEADER.createRequestHeader;
export const helpReducerType = "help";

interface HelpContent {
  content: string;
}

interface HelpState {
  helpGuides: ItemMap<HelpContent>;
}

const initialState: HelpState = {
  helpGuides: {},
};

const helpSlice = createAppSlice({
  name: helpReducerType,
  initialState,
  reducers: (create) => ({
    fetchHelp: create.asyncThunk(
      async (payload: { helpKey: string }, thunkApi) => {
        const headers = createRequestHeader();
        thunkApi.dispatch(showLoading());

        const response = await CustomAxios({
          errorToastMessage: "default",
        }).get(`${ENVIRONMENT.apiUrl}${APP_HELP(payload)}`, headers);

        thunkApi.dispatch(hideLoading());
        return response.data;
      },
      {
        fulfilled: (state: HelpState, action) => {
          const { help_key } = action.payload;
          state.helpGuides[help_key] = action.payload;
        },
        rejected: (state: HelpState, action) => {
          rejectHandler(action);
        },
      }
    ),
    createHelp: create.asyncThunk(
      async (payload: { helpKey: string; data: HelpContent }, thunkApi) => {
        const headers = createRequestHeader();
        thunkApi.dispatch(showLoading());

        const response = await CustomAxios({
          errorToastMessage: "default",
        }).post(`${ENVIRONMENT.apiUrl}${APP_HELP(payload)}`, headers);

        thunkApi.dispatch(hideLoading());
        return response.data;
      },
      {
        fulfilled: (state: HelpState, action) => {
          const { help_key } = action.payload;
          state.helpGuides[help_key] = action.payload;
        },
      }
    ),
    deleteHelp: create.asyncThunk(
      async (helpKey: string, thunkApi) => {
        const headers = createRequestHeader();
        thunkApi.dispatch(showLoading());

        const response = await CustomAxios({
          errorToastMessage: "default",
        }).delete(`${ENVIRONMENT.apiUrl}${APP_HELP({ helpKey })}`, headers);

        thunkApi.dispatch(hideLoading());
        return response.data;
      },
      {
        fulfilled: (state: HelpState, action) => {
          const helpKey = action.meta.arg;
          state[helpKey] = null;
        },
      }
    ),
  }),
  selectors: {
    getHelp: (state) => {
      return state.helpGuides;
    },
  },
});

const { getHelp } = helpSlice.selectors;
export const { fetchHelp, createHelp, deleteHelp } = helpSlice.actions;
const helpReducer = helpSlice.reducer;
export const getHelpByKey = (helpKey: string) =>
  createSelector([getHelp], (help) => {
    const pageHelp = help[helpKey];
    return pageHelp;
  });
export default helpReducer;
