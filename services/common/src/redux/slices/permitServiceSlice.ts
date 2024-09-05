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

const permitExtractionStatusMap = {
  PENDING: PermitExtractionStatus.in_progress,
  RECEIVED: PermitExtractionStatus.in_progress,
  PROGRESS: PermitExtractionStatus.in_progress,
  RETRY: PermitExtractionStatus.in_progress,
  STARTED: PermitExtractionStatus.in_progress,
  REVOKED: PermitExtractionStatus.error,
  FAILURE: PermitExtractionStatus.error,
  SUCCESS: PermitExtractionStatus.complete,
};

interface PermitExtraction {
  task_status: PermitExtractionStatus;
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
          const { task_id, task_status } = action.payload;
          state.extractions[permit_amendment_id] = {
            task_id,
            task_status: permitExtractionStatusMap[task_status],
          };
        },
        pending: (state, action) => {
          const { permit_amendment_id } = action.meta.arg;
          state.extractions[permit_amendment_id] = {
            task_status: PermitExtractionStatus.in_progress,
            task_id: null,
          };
        },
        rejected: (state, action) => {
          const { permit_amendment_id } = action.meta.arg;
          state.extractions[permit_amendment_id] = {
            task_status: PermitExtractionStatus.error,
            task_id: null,
          };
          rejectHandler(action);
        },
      }
    ),
    fetchPermitExtractionTasks: create.asyncThunk(
      async (payload: { permit_amendment_id: number }, thunkAPI) => {
        const { permit_amendment_id } = payload;
        const headers = createRequestHeader();
        thunkAPI.dispatch(showLoading());

        const response = await CustomAxios({
          errorToastMessage: "default",
        }).get(
          `${ENVIRONMENT.apiUrl}${PERMIT_SERVICE_EXTRACTION}?permit_amendment_id=${permit_amendment_id}`,
          headers
        );

        thunkAPI.dispatch(hideLoading());
        return response.data.tasks[0];
      },
      {
        fulfilled: (state, action) => {
          if (!action.payload) return;
          const { permit_amendment_id } = action.meta.arg;
          const { task_id, task_status } = action.payload;
          state.extractions[permit_amendment_id] = {
            task_id: task_id,
            task_status: permitExtractionStatusMap[task_status],
          };
        },
        rejected: (state, action) => {
          rejectHandler(action);
        },
      }
    ),

    fetchPermitExtractionStatus: create.asyncThunk(
      async (payload: { permit_amendment_id: number; task_id: string }, thunkAPI) => {
        const { permit_amendment_id, task_id } = payload;

        const headers = createRequestHeader();
        thunkAPI.dispatch(showLoading());

        const response = await CustomAxios({
          errorToastMessage: "default",
        }).get(`${ENVIRONMENT.apiUrl}${POLL_PERMIT_SERVICE_EXTRACTION(task_id)}`, headers);

        thunkAPI.dispatch(hideLoading());
        return response.data;
      },
      {
        fulfilled: (state, action) => {
          const { permit_amendment_id } = action.meta.arg;
          const { task_id, task_status } = action.payload;
          state.extractions[permit_amendment_id] = {
            task_id: task_id,
            task_status: permitExtractionStatusMap[task_status],
          };
        },
        rejected: (state, action) => {
          rejectHandler(action);
        },
      }
    ),
    deletePermitConditions: create.asyncThunk(
      async (payload: { permit_amendment_id: number }, thunkAPI) => {
        const headers = createRequestHeader();
        thunkAPI.dispatch(showLoading());
        const { permit_amendment_id } = payload;
        const response = await CustomAxios({
          errorToastMessage: "default",
        }).delete(
          `${ENVIRONMENT.apiUrl}${PERMIT_SERVICE_EXTRACTION}?permit_amendment_id=${permit_amendment_id}`,
          headers
        );

        thunkAPI.dispatch(hideLoading());
        return response.data;
      },
      {
        fulfilled: (state, action) => {
          const { permit_amendment_id } = action.meta.arg;
          state.extractions[permit_amendment_id] = {
            task_status: PermitExtractionStatus.not_started,
            task_id: null,
          };
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
export const {
  initiatePermitExtraction,
  fetchPermitExtractionStatus,
  fetchPermitExtractionTasks,
  deletePermitConditions,
} = permitServiceSlice.actions;

export const getPermitExtractionByGuid = (permit_amendment_id: number) =>
  createSelector([getPermitExtractionState], (extractions) => {
    return extractions[permit_amendment_id];
  });

const permitServiceReducer = permitServiceSlice.reducer;
export default permitServiceReducer;
