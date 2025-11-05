import { createAppSlice, rejectHandler } from "@mds/common/redux/createAppSlice";
import * as API from "@mds/common/constants/API";
import { createRequestHeader } from "../utils/RequestHeaders";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import { removeNullValues } from "@mds/common/constants/utils";
import CustomAxios from "../customAxios";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import * as Strings from "@mds/common/constants/strings";
import { notification } from "antd";

export const reportReducerType = "REPORTS";

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
  name: reportReducerType,
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
        return response?.data;
      },
      {
        fulfilled: (state: ReportsState, action) => {
          state.mineReports = action.payload?.records ?? [];
          state.reportsPageData = action.payload;
        },
        rejected: (_: ReportsState, action) => {
          rejectHandler(action);
        },
      }
    ),

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
        return response?.data;
      },
      {
        fulfilled: (state: ReportsState, action) => {
          state.upcomingMineReports = action.payload?.records ?? [];
          state.upcomingReportsPageData = action.payload;
        },
        rejected: (_: ReportsState, action) => {
          rejectHandler(action);
        },
      }
    ),

    fetchReports: create.asyncThunk(
      async ({ params = {} }: { params?: any }, thunkApi) => {
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
        return response?.data;
      },
      {
        fulfilled: (state: ReportsState, action) => {
          state.reports = action.payload?.records ?? [];
          state.reportsPageData = action.payload;
        },
        rejected: (_: ReportsState, action) => {
          rejectHandler(action);
        },
      }
    ),

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
        return response?.data;
      },
      {
        fulfilled: (state: ReportsState, action) => {
          state.mineReports = [action.payload];
          state.mineReportGuid = action.payload.mine_report_guid;
        },
        rejected: (_: ReportsState, action) => {
          rejectHandler(action);
        },
      }
    ),

    createMineReport: create.asyncThunk(
      async ({ mineGuid, payload }: { mineGuid: string; payload: any }, thunkApi) => {
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
          return thunkApi.rejectWithValue(error);
        } finally {
          thunkApi.dispatch(hideLoading("modal"));
        }
        return response?.data;
      },
      {
        rejected: (_: ReportsState, action) => {
          rejectHandler(action);
        },
      }
    ),

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
          return thunkApi.rejectWithValue(error);
        } finally {
          thunkApi.dispatch(hideLoading());
        }
        return response;
      },
      {
        rejected: (_: ReportsState, action) => {
          rejectHandler(action);
        },
      }
    ),
    storeMineReportComments: create.reducer((state, action: { payload: any }) => {
      state.reportComments = action.payload.records;
    }),
  }),
});

export const {
  fetchMineReports,
  fetchUpcomingMineReports,
  fetchReports,
  fetchMineReport,
  createMineReport,
  deleteMineReport,
  storeMineReportComments,
} = reportSlice.actions;

const reportReducer = reportSlice.reducer;
export default reportReducer;
