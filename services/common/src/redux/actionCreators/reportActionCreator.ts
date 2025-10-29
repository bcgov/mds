import * as API from "@mds/common/constants/API";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import { NetworkReducerTypes } from "@mds/common/constants/networkReducerTypes";
import * as Strings from "@mds/common/constants/strings";
import { removeNullValues } from "@mds/common/constants/utils";
import {
  clearMineReports,
  storeMineReport,
  storeMineReports,
  storeReports,
  storeUpcomingMineReports,
} from "@mds/common/redux/slices/reportSlice";
import { notification } from "antd";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import { error, request, success } from "../actions/genericActions";
import CustomAxios from "../customAxios";
import { createRequestHeader } from "../utils/RequestHeaders";

export const deleteMineReport = (mineGuid, mineReportGuid) => (dispatch) => {
  dispatch(request(NetworkReducerTypes.DELETE_MINE_REPORT));
  dispatch(showLoading());
  return CustomAxios()
    .delete(
      `${ENVIRONMENT.apiUrl}${API.MINE_REPORT(mineGuid, mineReportGuid)}`,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Successfully removed the report.",
        duration: 10,
      });
      dispatch(success(NetworkReducerTypes.DELETE_MINE_REPORT));
      return response;
    })
    .catch(() => {
      dispatch(error(NetworkReducerTypes.DELETE_MINE_REPORT));
    })
    .finally(() => dispatch(hideLoading()));
};

export const createMineReport = (mineGuid, payload) => (dispatch) => {
  dispatch(request(NetworkReducerTypes.CREATE_MINE_REPORT));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .post(`${ENVIRONMENT.apiUrl}${API.MINE_REPORTS(mineGuid)}`, payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: "Successfully created report.",
        duration: 10,
      });
      dispatch(success(NetworkReducerTypes.CREATE_MINE_REPORT));
      return response;
    })
    .catch(() => {
      dispatch(error(NetworkReducerTypes.CREATE_MINE_REPORT));
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const fetchUpcomingMineReports =
  (
    mineGuid,
    reportsType: string | string[] = [
      Strings.MINE_REPORTS_TYPE.codeRequiredReports,
      Strings.MINE_REPORTS_TYPE.permitRequiredReports,
    ],
    params = {}
  ) =>
  (dispatch) => {
    dispatch(request(NetworkReducerTypes.GET_MINE_REPORTS));
    dispatch(showLoading());
    const filteredParams = removeNullValues(params);

    return CustomAxios()
      .get(
        `${ENVIRONMENT.apiUrl}${API.MINE_UPCOMING_REPORTS(mineGuid, {
          ...filteredParams,
          mine_reports_type: reportsType,
        })}`,
        createRequestHeader()
      )
      .then((response) => {
        dispatch(success(NetworkReducerTypes.GET_MINE_REPORTS));
        dispatch(storeUpcomingMineReports(response.data));
        return response;
      })
      .catch(() => dispatch(error(NetworkReducerTypes.GET_MINE_REPORTS)))
      .finally(() => dispatch(hideLoading()));
  };

export const fetchReports =
  (params = {}) =>
  (dispatch) => {
    dispatch(request(NetworkReducerTypes.GET_REPORTS));
    dispatch(showLoading());
    return CustomAxios({ errorToastMessage: Strings.ERROR })
      .get(ENVIRONMENT.apiUrl + API.REPORTS(params), createRequestHeader())
      .then((response) => {
        dispatch(success(NetworkReducerTypes.GET_REPORTS));
        dispatch(storeReports(response.data));
      })
      .catch(() => dispatch(error(NetworkReducerTypes.GET_REPORTS)))
      .finally(() => dispatch(hideLoading()));
  };

export const fetchMineReport = (mineGuid, mineReportGuid) => (dispatch) => {
  dispatch(request(NetworkReducerTypes.GET_MINE_REPORT));
  dispatch(showLoading());
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl}${API.MINE_REPORT(mineGuid, mineReportGuid)}`, createRequestHeader())
    .then((response) => {
      dispatch(success(NetworkReducerTypes.GET_MINE_REPORT));
      dispatch(storeMineReport(response.data));
      return response.data;
    })
    .catch(() => {
      dispatch(error(NetworkReducerTypes.GET_MINE_REPORT));
    })
    .finally(() => dispatch(hideLoading()));
};
