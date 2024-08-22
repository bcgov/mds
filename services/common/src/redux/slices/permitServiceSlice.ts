import { createAppSlice, rejectHandler } from "@mds/common/redux/createAppSlice";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import CustomAxios from "@mds/common/redux/customAxios";
import { ItemMap } from "@mds/common/interfaces";
import { ENVIRONMENT, PERMIT_SERVICE_EXTRACTION } from "@mds/common/constants";
import { createSelector } from "@reduxjs/toolkit";

const createRequestHeader = REQUEST_HEADER.createRequestHeader;

export const permitServiceReducerType = "permitService";

export enum PermitExtractionStatus {
  not_started = "Not Started",
  in_progress = "In Progress",
  complete = "Extraction Complete",
  error = "Error Extracting",
}

interface PermitExtraction {
  status: PermitExtractionStatus;
  taskId: string;
}

interface PermitServiceState {
  // object of: permit_guid: {status: x, taskId: y}
  extractions: ItemMap<PermitExtraction>;
}

const initialState: PermitServiceState = {
  extractions: {},
};

const permitServiceSlice = createAppSlice({
  name: permitServiceReducerType,
  initialState,
  reducers: (create) => ({
    initiatePermitExtraction: create.asyncThunk(
      async (payload: { permit_guid: string }, thunkAPI) => {
        const { permit_guid } = payload;
        const headers = createRequestHeader();
        thunkAPI.dispatch(showLoading());

        const response = await CustomAxios({
          errorToastMessage: "default",
        }).post(`${ENVIRONMENT.apiUrl}${PERMIT_SERVICE_EXTRACTION(permit_guid)}`, headers);
        thunkAPI.dispatch(hideLoading());

        return response.data;
      },
      {
        fulfilled: (state, action) => {
          const { permit_guid, taskId, status } = action.payload;
          state.extractions[permit_guid] = { taskId, status };
        },
        pending: (state, action) => {
          const { permit_guid } = action.meta.arg;
          state.extractions[permit_guid] = {
            status: PermitExtractionStatus.in_progress,
            taskId: null,
          };
        },
        rejected: (state, action) => {
          const { permit_guid } = action.meta.arg;
          state.extractions[permit_guid] = { status: PermitExtractionStatus.error, taskId: null };
          rejectHandler(action);
        },
      }
    ),
    fetchPermitExtractionStatus: create.asyncThunk(
      async (payload: { permit_guid: string; taskId: string }, thunkAPI) => {
        const { permit_guid, taskId } = payload;

        const headers = createRequestHeader();
        thunkAPI.dispatch(showLoading());

        const response = await CustomAxios({
          errorToastMessage: "default",
        }).get(`${ENVIRONMENT.apiUrl}${PERMIT_SERVICE_EXTRACTION(permit_guid, taskId)}`, headers);

        thunkAPI.dispatch(hideLoading());
        return response.data;
      },
      {
        fulfilled: (state, action) => {
          const { permit_guid, taskId, status } = action.payload;
          state.extractions[permit_guid] = { taskId, status };
        },
        rejected: (state, action) => {
          rejectHandler(action);
        },
      }
    ),
  }),
  selectors: {
    getPermitExtractionState: (state: PermitServiceState) => {
      return state.extractions;
    },
  },
});

export const { getPermitExtractionState } = permitServiceSlice.selectors;
export const { initiatePermitExtraction, fetchPermitExtractionStatus } = permitServiceSlice.actions;

export const getPermitExtractionByGuid = (permitGuid: string) =>
  createSelector([getPermitExtractionState], (extractions) => {
    return extractions[permitGuid];
  });

const permitServiceReducer = permitServiceSlice.reducer;
export default permitServiceReducer;
