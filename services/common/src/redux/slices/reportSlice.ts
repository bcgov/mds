import { createAppSlice } from "@mds/common/redux/createAppSlice";
import * as API from "@mds/common/constants/API";
import { REPORTS } from "@mds/common/constants/reducerTypes";
import { createRequestHeader } from "../utils/RequestHeaders";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import { removeNullValues } from "@mds/common/constants/utils";
import CustomAxios from "../customAxios";
import { ENVIRONMENT } from "@mds/common/constants/environment";

export interface ReportsState {
  reports: any[];
  reportsPageData: any;
  mineReports: any[];
  mineReportGuid: string;
  reportComments: any[];
  upcomingMineReports: any[];
  upcomingReportsPageData: any;
}

const initialState: ReportsState = {
  reports: [],
  reportsPageData: {},
  mineReports: [],
  mineReportGuid: "",
  reportComments: [],
  upcomingMineReports: [],
  upcomingReportsPageData: {},
};

const reportSlice = createAppSlice({
  name: REPORTS,
  initialState,
  reducers: (create) => ({
    fetchMineReports: create.asyncThunk(
      async (
        {
          mineGuid,
          reportsType,
          params,
        }: { mineGuid: string; reportsType?: string | string[]; params?: any },
        thunkApi
      ) => {
        const headers = createRequestHeader();
        thunkApi.dispatch(showLoading());
        let response;
        try {
          const filteredParams = removeNullValues(params);
          response = await CustomAxios({ errorToastMessage: "Failed to fetch mine reports" }).get(
            `${ENVIRONMENT.apiUrl}${API.MINE_REPORTS(mineGuid, {
              ...filteredParams,
              mine_reports_type: reportsType,
            })}`,
            headers
          );
        } catch (error) {
          thunkApi.rejectWithValue(error);
        } finally {
          thunkApi.dispatch(hideLoading());
        }
        return response.data;
      },
      {
        fulfilled: (state: ReportsState, action) => {
          state.mineReports = action.payload.records;
          state.reportsPageData = action.payload;
        },
      }
    ),
    storeReports: create.reducer((state, action: { payload: any }) => {
      state.reports = action.payload.records;
      state.reportsPageData = action.payload;
    }),
    storeMineReports: create.reducer((state, action: { payload: any }) => {
      state.mineReports = action.payload.records;
      state.reportsPageData = action.payload;
      state.mineReportGuid = "";
    }),
    clearMineReports: create.reducer((state) => {
      state.mineReports = initialState.mineReports;
    }),
    storeMineReport: create.reducer((state, action: { payload: any }) => {
      state.mineReports = [action.payload];
      state.mineReportGuid = action.payload.mine_report_guid;
    }),
    storeMineReportComments: create.reducer((state, action: { payload: any }) => {
      state.reportComments = action.payload.records;
    }),
    storeUpcomingMineReports: create.reducer((state, action: { payload: any }) => {
      state.upcomingMineReports = action.payload.records;
      state.upcomingReportsPageData = action.payload;
    }),
  }),
});

export const {
  storeReports,
  storeMineReports,
  clearMineReports,
  storeMineReport,
  storeMineReportComments,
  storeUpcomingMineReports,
  fetchMineReports,
} = reportSlice.actions;

const reportReducer = reportSlice.reducer;
export default reportReducer;
