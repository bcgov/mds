import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { ENVIRONMENT } from "@mds/common";
import { request, success, error } from "../actions/genericActions";
import * as reducerTypes from "@mds/common/constants/reducerTypes";
import * as mineReportActions from "../actions/mineReportActions";
import * as API from "@mds/common/constants/API";
import * as Strings from "@mds/common/constants/strings";
import { createRequestHeader } from "../utils/RequestHeaders";
import CustomAxios from "../customAxios";

export const deleteMineReport = (mineGuid, mineReportGuid) => (dispatch) => {
  dispatch(request(reducerTypes.DELETE_MINE_REPORT));
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
      dispatch(success(reducerTypes.DELETE_MINE_REPORT));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.DELETE_MINE_REPORT));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading()));
};

export const createMineReport = (mineGuid, payload) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_MINE_REPORT));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .post(`${ENVIRONMENT.apiUrl}${API.MINE_REPORTS(mineGuid)}`, payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: "Successfully created report.",
        duration: 10,
      });
      dispatch(success(reducerTypes.CREATE_MINE_REPORT));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.CREATE_MINE_REPORT));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const fetchMineReports = (
  mineGuid,
  reportsType = Strings.MINE_REPORTS_TYPE.codeRequiredReports
) => (dispatch) => {
  dispatch(request(reducerTypes.GET_MINE_REPORTS));
  dispatch(showLoading());
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl}${API.MINE_REPORTS(mineGuid, reportsType)}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_REPORTS));
      dispatch(mineReportActions.storeMineReports(response.data));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GET_MINE_REPORTS)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchReports = (params = {}) => (dispatch) => {
  dispatch(request(reducerTypes.GET_REPORTS));
  dispatch(showLoading());
  return CustomAxios({ errorToastMessage: Strings.ERROR })
    .get(ENVIRONMENT.apiUrl + API.REPORTS(params), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_REPORTS));
      dispatch(mineReportActions.storeReports(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_REPORTS)))
    .finally(() => dispatch(hideLoading()));
};

export const updateMineReport = (mineGuid, mineReportGuid, payload) => (dispatch) => {
  dispatch(request(reducerTypes.UPDATE_MINE_REPORT));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .put(
      `${ENVIRONMENT.apiUrl}${API.MINE_REPORT(mineGuid, mineReportGuid)}`,
      payload,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Successfully updated report.",
        duration: 10,
      });
      dispatch(success(reducerTypes.UPDATE_MINE_REPORT));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.UPDATE_MINE_REPORT));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const fetchMineReport = (mineGuid, mineReportGuid) => (dispatch) => {
  dispatch(request(reducerTypes.GET_MINE_REPORT));
  dispatch(showLoading());
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl}${API.MINE_REPORT(mineGuid, mineReportGuid)}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_REPORT));
      dispatch(mineReportActions.storeMineReport(response.data));
      return response.data;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.GET_MINE_REPORT));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading()));
};
