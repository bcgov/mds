import { hideLoading, showLoading } from "react-redux-loading-bar";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import { createAppSlice, rejectHandler } from "@mds/common/redux/createAppSlice";
import CustomAxios from "@mds/common/redux/customAxios";
import * as API from "@mds/common/constants/API";
import {
    ItemMap,
} from "@mds/common/interfaces";
import { createSelector } from "@reduxjs/toolkit";
import { IAmsFinalApplication } from "@mds/common/interfaces/projects/amsFinalApplication.interface";

export const amsAppReducerType = "AMS_FINAL_APPLICATION";

const createRequestHeader = REQUEST_HEADER.createRequestHeader;

interface AmsFinalAppState {
    amsFinalApplications: ItemMap<IAmsFinalApplication>;
};

const initialState: AmsFinalAppState = {
    amsFinalApplications: {}
};

const amsFinalAppSlice = createAppSlice({
    name: amsAppReducerType,
    initialState,
    reducers: (create) => ({
        createAmsFinalApp: create.asyncThunk(
            async (payload: {
                projectSummaryGuid: string,
                projectSummaryAuthorizationGuid: string,
                application: Partial<IAmsFinalApplication>
            }, thunkApi) => {
                const headers = createRequestHeader();
                thunkApi.dispatch(showLoading());
                const { projectSummaryGuid, projectSummaryAuthorizationGuid, application } = payload;
                const applicationPayload = {
                    ...application,
                    project_summary_authorization_guid: projectSummaryAuthorizationGuid
                };

                let resp;
                try {
                    resp = await CustomAxios({
                        successToastMessage: "Successfully created new application",
                    }).post(`${ENVIRONMENT.apiUrl}${API.PROJECT_SUMMARY_ENVIRONMENT_FINAL_APPLICATION(projectSummaryGuid, projectSummaryAuthorizationGuid)}`,
                        applicationPayload, headers);
                } finally {
                    thunkApi.dispatch(hideLoading());
                }
                return resp.data;
            },
            {
                fulfilled: (state: AmsFinalAppState, action) => {
                    const newApplication = action.payload;
                    state.amsFinalApplications[newApplication.project_summary_authorization_guid] = newApplication;
                },
                rejected: (state: AmsFinalAppState, action) => {
                    rejectHandler(action)
                }
            }
        ),
        updateAmsFinalApp: create.asyncThunk(
            async (payload: {
                projectSummaryGuid: string,
                projectSummaryAuthorizationGuid: string,
                application: Partial<IAmsFinalApplication>
            }, thunkApi) => {
                const headers = createRequestHeader();
                thunkApi.dispatch(showLoading());
                const { projectSummaryGuid, projectSummaryAuthorizationGuid, application } = payload;

                let resp;
                try {
                    resp = await CustomAxios({
                        successToastMessage: "Successfully updated application",
                    }).put(`${ENVIRONMENT.apiUrl}${API.PROJECT_SUMMARY_ENVIRONMENT_FINAL_APPLICATION(projectSummaryGuid, projectSummaryAuthorizationGuid)}`,
                        application, headers);
                } finally {
                    thunkApi.dispatch(hideLoading());
                }
                return resp.data;
            },
            {
                fulfilled: (state: AmsFinalAppState, action) => {
                    const newApplication = action.payload;
                    state.amsFinalApplications[newApplication.project_summary_authorization_guid] = newApplication;
                },
                rejected: (state: AmsFinalAppState, action) => {
                    rejectHandler(action)
                }
            }
        ),
        fetchAmsFinalApp: create.asyncThunk(
            async (payload: { projectSummaryGuid: string, projectSummaryAuthorizationGuid: string }, thunkApi) => {
                const headers = createRequestHeader();
                thunkApi.dispatch(showLoading());

                let resp;
                try {
                    resp = await CustomAxios({
                        errorToastMessage: "Failed to load authorization final application",
                    }).get(`${ENVIRONMENT.apiUrl}${API.PROJECT_SUMMARY_ENVIRONMENT_FINAL_APPLICATION_GET(payload.projectSummaryGuid, payload.projectSummaryAuthorizationGuid)}`,
                        headers);
                } finally {
                    thunkApi.dispatch(hideLoading());
                }
                return resp.data;
            }, {
            fulfilled: (state, action) => {
                const { projectSummaryAuthorizationGuid } = action.meta.arg;
                const { records } = action.payload;
                state.amsFinalApplications[projectSummaryAuthorizationGuid] = records[0] ?? null;
            },
            rejected: (state, action) => {
                rejectHandler(action);
            }
        }
        )
    }),
    selectors: {
        getAmsFinalApps: (state) => {
            return state.amsFinalApplications;
        }
    }
});

const {
    getAmsFinalApps
} = amsFinalAppSlice.selectors;

export const getAmsFinalAppByAuthGuid = (authGuid: string) =>
    createSelector([getAmsFinalApps], (appData) => {
        return appData[authGuid];
    });

export const getAmsFinalAppIsLoaded = (authGuid: string) =>
    createSelector([getAmsFinalApps], (appData) => {
        return Object.keys(appData).includes(authGuid);
    })
export const { fetchAmsFinalApp, createAmsFinalApp, updateAmsFinalApp } = amsFinalAppSlice.actions;

const amsFinalAppReducer = amsFinalAppSlice.reducer;
export default amsFinalAppReducer;