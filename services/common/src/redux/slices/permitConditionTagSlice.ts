import { IPermitConditionTag } from "@mds/common/interfaces";
import { createAppSlice, rejectHandler } from "../createAppSlice";
import CustomAxios from "../customAxios";
import { createRequestHeader } from "../utils/RequestHeaders";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import * as API from "@mds/common/constants/API";
import { notification } from "antd";


export const permitConditionTagReducerType = "permitConditionTags";

interface permitConditionTagsState {
    permitConditionTags: IPermitConditionTag[];
}

const initialState: permitConditionTagsState = {
    permitConditionTags: [],
};

const permitConditionTagSlice = createAppSlice({
    name: permitConditionTagReducerType,
    initialState,
    reducers: (create) => ({

        createPermitConditionTag: create.asyncThunk(
            async (tag: IPermitConditionTag, thunkAPI) => {
                const headers = createRequestHeader();
                thunkAPI.dispatch(showLoading());
                const response = await CustomAxios({
                    errorToastMessage: "Error creating permit condition tag",
                }).post(`${ENVIRONMENT.apiUrl}${API.PERMIT_CONDITION_TAGS()}`, tag, headers);
                thunkAPI.dispatch(hideLoading());
                return response.data;
            }, {
            fulfilled: (state, action) => {
                state.permitConditionTags.push(action.payload);
                state.permitConditionTags.sort((a, b) => a.description.localeCompare(b.description));
            },
            rejected: (state, action) => {
                rejectHandler(action);
            }
        }),

        updatePermitConditionTag: create.asyncThunk(
            async (tag: IPermitConditionTag, thunkAPI) => {
                const headers = createRequestHeader();
                thunkAPI.dispatch(showLoading());
                const response = await CustomAxios({
                    errorToastMessage: "Error updating permit condition tag",
                }).put(`${ENVIRONMENT.apiUrl}${API.PERMIT_CONDITION_TAG(tag.permit_condition_tag_guid)}`, tag, headers);
                thunkAPI.dispatch(hideLoading());
                return response.data;
            }, {
            fulfilled: (state, action) => {
                notification.success({
                    message: "Successfully updated permit condition tag.",
                    duration: 5,
                });
                const index = state.permitConditionTags.findIndex(t => t.permit_condition_tag_guid === action.payload.permit_condition_tag_guid);
                if (index !== -1) {
                    console.log(action.payload)
                    state.permitConditionTags[index] = action.payload;
                }
            },
            rejected: (state, action) => {
                rejectHandler(action);
            }
        }),

        deletePermitConditionTag: create.asyncThunk(
            async (condition_tag_guid: string, thunkAPI) => {
                const headers = createRequestHeader();
                thunkAPI.dispatch(showLoading());
                const response = await CustomAxios({
                    errorToastMessage: "Error deleting permit condition tag",
                }).delete(`${ENVIRONMENT.apiUrl}${API.PERMIT_CONDITION_TAG(condition_tag_guid)}`, headers);
                thunkAPI.dispatch(hideLoading());
                return response.data;
            }, {
            fulfilled: (state, action) => {
                notification.success({
                    message: "Successfully deleted permit condition tag.",
                    duration: 5,
                });
            },
            rejected: (state, action) => {
                rejectHandler(action);
            }
        }),

        fetchPermitConditionTags: create.asyncThunk(
            async (_, thunkAPI) => {
                const headers = createRequestHeader();
                thunkAPI.dispatch(showLoading());
                const response = await CustomAxios({
                    errorToastMessage: "Error fetching permit condition tags",
                }).get(`${ENVIRONMENT.apiUrl}${API.PERMIT_CONDITION_TAGS()}`, headers);
                thunkAPI.dispatch(hideLoading());
                return response.data;
            }, {
            fulfilled: (state, action) => {
                state.permitConditionTags = action.payload.records;
            },
            rejected: (state, action) => {
                rejectHandler(action);
            }
        })

    }),
    selectors: {
        getPermitConditionTags: (state: permitConditionTagsState) => state.permitConditionTags,
    }
});

export const { getPermitConditionTags } = permitConditionTagSlice.selectors;
export const {
    createPermitConditionTag,
    updatePermitConditionTag,
    deletePermitConditionTag,
    fetchPermitConditionTags
} = permitConditionTagSlice.actions;

export default permitConditionTagSlice.reducer;