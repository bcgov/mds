import { createAppSlice, rejectHandler } from "@mds/common/redux/createAppSlice";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import CustomAxios from "@mds/common/redux/customAxios";
import { ItemMap } from "@mds/common/interfaces";
import { createSelector } from "@reduxjs/toolkit";

const createRequestHeader = REQUEST_HEADER.createRequestHeader;
export const appHelpReducerType = "appHelp";

interface AppHelpContent {
    content: string;
    is_draft: boolean;
}

interface AppHelpState {
    helpPages: ItemMap<AppHelpContent>;
};

const initialState: AppHelpState = {
    helpPages: {
        "home": { content: "this is help for home", is_draft: false },
        "mine-dashboard_overview": { content: "content specifically for the overview tab", is_draft: false },
        "mine-dashboard": { content: "fallback content for other pages on mine dashboard", is_draft: false },
    }
};

const appHelpSlice = createAppSlice({
    name: appHelpReducerType,
    initialState,
    reducers: (create) => ({
        fetchHelp: create.asyncThunk(
            async (_, thunkAPI) => {
                const headers = createRequestHeader();
                thunkAPI.dispatch(showLoading());
                thunkAPI.dispatch(hideLoading());
                console.log('called for help')
                return [];
            },
            {
                fulfilled: (state, action) => {
                    state.helpPages = {};
                },
                rejected: (state, action) => {
                    rejectHandler(action);
                },
            }),
        createHelp: create.asyncThunk(
            async (payload: { helpKey: string, data: AppHelpContent }, thunkApi) => {
                return payload.data;
            },
            {
                fulfilled: (state, action) => {
                    const { helpKey, data } = action.meta.arg;
                    state.helpPages[helpKey] = data;
                }
            }
        )
    }),
    selectors: {
        getHelp: (state) => {
            return state.helpPages
        },
    },
});

export const getHelpByKey = (helpKey: string, tab?: string) =>
    createSelector([getHelp], (appHelp) => {
        const pageHelp = appHelp[helpKey];
        if (!tab) { return pageHelp; }
        const tabHelp = appHelp[`${helpKey}_${tab}`];
        return tabHelp ?? pageHelp;
    });

export const { fetchHelp, createHelp } = appHelpSlice.actions;
export const { getHelp } = appHelpSlice.selectors;
const appHelpReducer = appHelpSlice.reducer;
export default appHelpReducer;