import { createAppSlice } from "@mds/common/redux/createAppSlice";
import * as API from "@mds/common/constants/API";
import { REPORTS } from "@mds/common/constants/reducerTypes";
import { createRequestHeader } from "../utils/RequestHeaders";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import { removeNullValues } from "@mds/common/constants/utils";
import CustomAxios from "../customAxios";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import * as Strings from "@mds/common/constants/strings";
import { notification } from "antd";

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
    // GET /mines/:mineGuid/reports (optionally with mine_reports_type)
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

    // GET /mines/:mineGuid/reports (upcoming)
    fetchUpcomingMineReports: create.asyncThunk(
      async (
        {
          mineGuid,
          reportsType = [
            Strings.MINE_REPORTS_TYPE.codeRequiredReports,
            Strings.MINE_REPORTS_TYPE.permitRequiredReports,
          ],
          params = {},
        }: { mineGuid: string; reportsType?: string | string[]; params?: any },
        thunkApi
      ) => {
        const headers = createRequestHeader();
        thunkApi.dispatch(showLoading());
        let response;
        try {
          const filteredParams = removeNullValues(params);
          response = await CustomAxios().get(
            `${ENVIRONMENT.apiUrl}${API.MINE_UPCOMING_REPORTS(mineGuid, {
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
          state.upcomingMineReports = action.payload.records;
          state.upcomingReportsPageData = action.payload;
        },
      }
    ),

    // GET /mines/reports (global reports search)
    fetchReports: create.asyncThunk(
      async (
        { params = {} }: { params?: any },
        thunkApi
      ) => {
        const headers = createRequestHeader();
        thunkApi.dispatch(showLoading());
        let response;
        try {
          response = await CustomAxios({ errorToastMessage: Strings.ERROR }).get(
            `${ENVIRONMENT.apiUrl}${API.REPORTS(params)}`,
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
          state.reports = action.payload.records;
          state.reportsPageData = action.payload;
        },
      }
    ),

    // GET /mines/:mineGuid/reports/:mineReportGuid
    fetchMineReport: create.asyncThunk(
      async (
        { mineGuid, mineReportGuid }: { mineGuid: string; mineReportGuid: string },
        thunkApi
      ) => {
        const headers = createRequestHeader();
        thunkApi.dispatch(showLoading());
        let response;
        try {
          response = await CustomAxios().get(
            `${ENVIRONMENT.apiUrl}${API.MINE_REPORT(mineGuid, mineReportGuid)}`,
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
          state.mineReports = [action.payload];
          state.mineReportGuid = action.payload.mine_report_guid;
        },
      }
    ),

    // POST /mines/:mineGuid/reports
    createMineReport: create.asyncThunk(
      async (
        { mineGuid, payload }: { mineGuid: string; payload: any },
        thunkApi
      ) => {
        const headers = createRequestHeader();
        thunkApi.dispatch(showLoading("modal"));
        let response;
        try {
          response = await CustomAxios().post(
            `${ENVIRONMENT.apiUrl}${API.MINE_REPORTS(mineGuid)}`,
            payload,
            headers
          );
          notification.success({ message: "Successfully created report.", duration: 10 });
        } catch (error) {
          thunkApi.rejectWithValue(error);
        } finally {
          thunkApi.dispatch(hideLoading("modal"));
        }
        return response?.data;
      }
    ),

    // DELETE /mines/:mineGuid/reports/:mineReportGuid
    deleteMineReport: create.asyncThunk(
      async (
        { mineGuid, mineReportGuid }: { mineGuid: string; mineReportGuid: string },
        thunkApi
      ) => {
        const headers = createRequestHeader();
        thunkApi.dispatch(showLoading());
        let response;
        try {
          response = await CustomAxios().delete(
            `${ENVIRONMENT.apiUrl}${API.MINE_REPORT(mineGuid, mineReportGuid)}`,
            headers
          );
          notification.success({ message: "Successfully removed the report.", duration: 10 });
        } catch (error) {
          thunkApi.rejectWithValue(error);
        } finally {
          thunkApi.dispatch(hideLoading());
        }
        return response;
      }
    ),

    // Legacy direct store reducers (kept for compatibility)
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
  // thunks
  fetchMineReports,
  fetchUpcomingMineReports,
  fetchReports,
  fetchMineReport,
  createMineReport,
  deleteMineReport,
  // reducers
  storeReports,
  storeMineReports,
  clearMineReports,
  storeMineReport,
  storeMineReportComments,
  storeUpcomingMineReports,
} = reportSlice.actions;

const reportReducer = reportSlice.reducer;
export default reportReducer;
