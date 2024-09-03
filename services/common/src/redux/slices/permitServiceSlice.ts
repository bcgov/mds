import { createAppSlice, rejectHandler } from "@mds/common/redux/createAppSlice";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import CustomAxios from "@mds/common/redux/customAxios";
import { ItemMap } from "@mds/common/interfaces";
import {
  ENVIRONMENT,
  PERMIT_SERVICE_EXTRACTION,
  POLL_PERMIT_SERVICE_EXTRACTION,
} from "@mds/common/constants";
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
  task_id: string;
}

interface PermitServiceState {
  // object of: permit_amendment_id: {status: x, task_id: y}
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
      async (
        payload: { permit_amendment_id: number; permit_amendment_document_guid: string },
        thunkAPI
      ) => {
        const headers = createRequestHeader();
        thunkAPI.dispatch(showLoading());

        const response = await CustomAxios({
          errorToastMessage: "default",
        }).post(`${ENVIRONMENT.apiUrl}${PERMIT_SERVICE_EXTRACTION}`, payload, headers);
        thunkAPI.dispatch(hideLoading());

        return response.data;
      },
      {
        fulfilled: (state, action) => {
          const { permit_amendment_id } = action.meta.arg;
          const { task_id, status } = action.payload;
          state.extractions[permit_amendment_id] = { task_id, status };
        },
        pending: (state, action) => {
          const { permit_amendment_id } = action.meta.arg;
          state.extractions[permit_amendment_id] = {
            status: PermitExtractionStatus.in_progress,
            task_id: null,
          };
        },
        rejected: (state, action) => {
          const { permit_amendment_id } = action.meta.arg;
          state.extractions[permit_amendment_id] = {
            status: PermitExtractionStatus.error,
            task_id: null,
          };
          rejectHandler(action);
        },
      }
    ),
    fetchPermitExtractionStatus: create.asyncThunk(
      async (payload: { permit_amendment_id: string; task_id: string }, thunkAPI) => {
        const { permit_amendment_id, task_id } = payload;

        const headers = createRequestHeader();
        thunkAPI.dispatch(showLoading());

        const response = await CustomAxios({
          errorToastMessage: "default",
        }).get(
          `${ENVIRONMENT.apiUrl}${POLL_PERMIT_SERVICE_EXTRACTION(task_id)}`,
          { permit_amendment_id },
          headers
        );

        thunkAPI.dispatch(hideLoading());
        return response.data;
      },
      {
        fulfilled: (state, action) => {
          const { permit_amendment_id } = action.meta.arg;
          const { task_id, status } = action.payload;
          state.extractions[permit_amendment_id] = { task_id: task_id, status };
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

export const getPermitExtractionByGuid = (permit_amendment_id: string) =>
  createSelector([getPermitExtractionState], (extractions) => {
    return extractions[permit_amendment_id];
  });

const permitServiceReducer = permitServiceSlice.reducer;
export default permitServiceReducer;
