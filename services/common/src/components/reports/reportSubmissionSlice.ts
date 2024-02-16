import { hideLoading, showLoading } from "react-redux-loading-bar";
import { ENVIRONMENT, IMineReportSubmission } from "../..";
import { createAppSlice } from "@mds/common/redux/createAppSlice";
import CustomAxios from "@mds/common/redux/customAxios";
import * as API from "@mds/common/constants/API";
import { RootState } from "@mds/common/redux/rootState";
import moment from "moment";

interface ReportSubmissionState {
  reportSubmission: IMineReportSubmission;
  mineReportGuid: string;
}

const initialState: ReportSubmissionState = {
  reportSubmission: null,
  mineReportGuid: null,
};

const createRequestHeader = REQUEST_HEADER.createRequestHeader;

// could probably make this generic
// the stack doesn't print nicely with action.error, action.error.stack outputs the \n properly
const rejectHandler = (action) => {
  console.log(action.error);
  console.log(action.error.stack);
};

const submissionSlice = createAppSlice({
  name: "reportSubmissions",
  initialState: initialState,
  reducers: (create) => ({
    fetchLatestReportSubmission: create.asyncThunk(
      async (payload: { mine_report_guid: string }, thunkApi) => {
        const headers = createRequestHeader();
        thunkApi.dispatch(showLoading());
        const resp = await CustomAxios({
          errorToastMessage: "Failed to load report submission",
        }).get(`${ENVIRONMENT.apiUrl}${API.MINE_REPORT_SUBMISSIONS(payload, true)}`, headers);
        thunkApi.dispatch(hideLoading());
        return resp.data;
      },
      {
        fulfilled: (state, action) => {
          state.reportSubmission = action.payload;
          state.mineReportGuid = action.payload.mine_report_guid;
        },
        rejected: (_state, action) => {
          rejectHandler(action);
        },
      }
    ),
    createReportSubmission: create.asyncThunk(
      async (payload: IMineReportSubmission, thunkApi) => {
        const headers = createRequestHeader();
        thunkApi.dispatch(showLoading());
        const messages = {
          errorToastMessage: "default",
          successToastMessage: "Successfully created new report submission",
        };
        const received_date = payload.received_date ?? moment().format("YYYY-MM-DD");
        const resp = await CustomAxios(messages).post(
          `${ENVIRONMENT.apiUrl}${API.REPORT_SUBMISSIONS()}`,
          { ...payload, received_date },
          headers
        );
        thunkApi.dispatch(hideLoading());
        return resp.data;
      },
      {
        fulfilled: (state, action) => {
          state.reportSubmission = action.payload;
        },
        rejected: (_state, action) => {
          rejectHandler(action);
        },
      }
    ),
  }),
  selectors: {
    getLatestReportSubmission: (state, mineReportGuid): IMineReportSubmission => {
      if (mineReportGuid === state.mineReportGuid) {
        return state.reportSubmission;
      }
      return null;
    },
  },
});

export const { fetchLatestReportSubmission, createReportSubmission } = submissionSlice.actions;
export const { getLatestReportSubmission } = submissionSlice.getSelectors(
  (rootState: RootState) => rootState.reportSubmission
);

const reportSubmissionReducer = submissionSlice.reducer;
export default reportSubmissionReducer;
