// Transitional compatibility layer: legacy action creators that accept positional params
// now delegate to slice async thunks which accept a single object parameter.
// Prefer importing thunks directly from the slice and calling with an object.

import {
  fetchMineReports as fetchMineReportsThunk,
  fetchUpcomingMineReports as fetchUpcomingMineReportsThunk,
  fetchReports as fetchReportsThunk,
  fetchMineReport as fetchMineReportThunk,
  createMineReport as createMineReportThunk,
  deleteMineReport as deleteMineReportThunk,
} from "@mds/common/redux/slices/reportSlice";

export const deleteMineReport = (mineGuid: string, mineReportGuid: string) => (dispatch) =>
  dispatch(deleteMineReportThunk({ mineGuid, mineReportGuid }));

export const createMineReport = (mineGuid: string, payload: any) => (dispatch) =>
  dispatch(createMineReportThunk({ mineGuid, payload }));

export const fetchUpcomingMineReports = (
  mineGuid: string,
  reportsType?: string | string[],
  params: any = {}
) => (dispatch) => dispatch(fetchUpcomingMineReportsThunk({ mineGuid, reportsType, params }));

export const fetchReports = (params: any = {}) => (dispatch) =>
  dispatch(fetchReportsThunk({ params }));

export const fetchMineReport = (mineGuid: string, mineReportGuid: string) => (dispatch) =>
  dispatch(fetchMineReportThunk({ mineGuid, mineReportGuid }));

// Also export the new thunks for direct usage in updated code
export {
  fetchUpcomingMineReportsThunk as fetchUpcomingMineReportsThunk,
  fetchReportsThunk as fetchReportsThunk,
  fetchMineReportThunk as fetchMineReportThunk,
  createMineReportThunk as createMineReportThunk,
  deleteMineReportThunk as deleteMineReportThunk,
};
