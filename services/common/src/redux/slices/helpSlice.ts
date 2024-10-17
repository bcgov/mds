import { createAppSlice, rejectHandler } from "@mds/common/redux/createAppSlice";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import CustomAxios from "@mds/common/redux/customAxios";
import { ItemMap } from "@mds/common/interfaces";
import { createSelector } from "@reduxjs/toolkit";
import { APP_HELP, ENVIRONMENT } from "@mds/common/constants";

const createRequestHeader = REQUEST_HEADER.createRequestHeader;
export const helpReducerType = "help";

export const HELP_GUIDE_ALL_TABS = "all_tabs";
export const EMPTY_HELP_KEY = "default";

interface HelpContent {
  help_guid?: string;
  content: string;
  system: string;
  page_tab?: string;
  help_key: string;
}

interface HelpState {
  helpGuides: ItemMap<HelpContent[]>;
}

const initialState: HelpState = {
  helpGuides: {},
};

const helpSlice = createAppSlice({
  name: helpReducerType,
  initialState,
  reducers: (create) => ({
    fetchHelp: create.asyncThunk(
      async (params: { helpKey: string; system: string }, thunkApi) => {
        const { helpKey, system } = params;
        const headers = createRequestHeader();
        thunkApi.dispatch(showLoading());

        const response = await CustomAxios({
          errorToastMessage: "default",
        }).get(`${ENVIRONMENT.apiUrl}${APP_HELP(helpKey, { system })}`, headers);

        thunkApi.dispatch(hideLoading());
        return response.data;
      },
      {
        fulfilled: (state: HelpState, action) => {
          const { helpKey } = action.meta.arg;
          state.helpGuides[helpKey] = action.payload.records;
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
        }).post(`${ENVIRONMENT.apiUrl}${APP_HELP(payload.helpKey)}`, payload.data, headers);

        thunkApi.dispatch(hideLoading());
        return response.data;
      },
      {
        fulfilled: (state: HelpState, action) => {
          const { helpKey } = action.meta.arg;
          const newGuide = action.payload;
          const remainingGuides = state.helpGuides[helpKey].filter(
            (item) => item.help_guid !== newGuide.help_guid
          );
          state.helpGuides[helpKey] = [newGuide, ...remainingGuides];
        },
      }
    ),
    updateHelp: create.asyncThunk(
      async (payload: { helpKey: string; data: HelpContent }, thunkApi) => {
        const headers = createRequestHeader();
        thunkApi.dispatch(showLoading());

        const response = await CustomAxios({
          errorToastMessage: "default",
        }).put(`${ENVIRONMENT.apiUrl}${APP_HELP(payload.helpKey)}`, payload.data, headers);

        thunkApi.dispatch(hideLoading());
        return response.data;
      },
      {
        fulfilled: (state: HelpState, action) => {
          const { helpKey } = action.meta.arg;
          const newGuide = action.payload;
          const remainingGuides = state.helpGuides[helpKey].filter(
            (item) => item.help_guid !== newGuide.help_guid
          );
          state.helpGuides[helpKey] = [newGuide, ...remainingGuides];
        },
      }
    ),
    // prevent the state from bloating- clear everything except default & preserveKey
    clearHelp: create.asyncThunk(
      (preserveKey: string) => {
        return preserveKey;
      },
      {
        fulfilled: (state: HelpState, action) => {
          const preserveKey = action.meta.arg;
          const newState = {
            [EMPTY_HELP_KEY]: state.helpGuides[EMPTY_HELP_KEY],
            [preserveKey]: state.helpGuides[preserveKey],
          };
          console.log("newState", newState);
          state.helpGuides = newState;
        },
      }
    ),
    deleteHelp: create.asyncThunk(
      async (params: { helpKey: string; help_guid: string }, thunkApi) => {
        const { helpKey, help_guid } = params;
        const headers = createRequestHeader();
        thunkApi.dispatch(showLoading());

        const response = await CustomAxios({
          errorToastMessage: "default",
        }).delete(`${ENVIRONMENT.apiUrl}${APP_HELP(helpKey, { help_guid })}`, headers);

        thunkApi.dispatch(hideLoading());
        return response.data;
      },
      {
        fulfilled: (state: HelpState, action) => {
          const { helpKey, help_guid } = action.meta.arg;
          const remainingGuides = state.helpGuides[helpKey].filter(
            (item) => item.help_guid !== help_guid
          );
          state.helpGuides[helpKey] = remainingGuides;
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
export const { fetchHelp, createHelp, updateHelp, deleteHelp, clearHelp } = helpSlice.actions;
const helpReducer = helpSlice.reducer;

export const getHelpByKey = (helpKey: string, pageTab?: string) =>
  createSelector([getHelp], (help) => {
    const pageHelp = help[helpKey];

    if (!pageHelp || pageHelp.length === 0) {
      const defaultHelp = help[EMPTY_HELP_KEY];
      return defaultHelp?.length > 0 ? defaultHelp[0] : null;
    }

    const includeTabs = pageTab ? [HELP_GUIDE_ALL_TABS, pageTab] : [HELP_GUIDE_ALL_TABS];

    const guides = pageHelp.filter((guide) => includeTabs.includes(guide.page_tab));
    if (pageTab) {
      const tabGuides = guides.filter((guide) => guide.page_tab === pageTab);
      return tabGuides[0] ?? guides[0];
    }

    return guides[0];
  });
export default helpReducer;
