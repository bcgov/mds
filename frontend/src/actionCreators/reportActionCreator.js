import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { request, success, error } from "@/actions/genericActions";
import * as reducerTypes from "@/constants/reducerTypes";
import * as mineReportActions from "@/actions/mineReportActions";
import * as API from "@/constants/API";
import { ENVIRONMENT } from "@/constants/environment";
import { createRequestHeader } from "@/utils/RequestHeaders";
import CustomAxios from "@/customAxios";

export const deleteMineReport = (mineGuid, mineReportGuid) => (dispatch) => {
  dispatch(request(reducerTypes.DELETE_MINE_REPORT));
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
    .catch(() => dispatch(error(reducerTypes.DELETE_MINE_REPORT)));
};

export const createMineReport = (mineGuid, payload) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_MINE_REPORT));
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
    .catch(() => dispatch(error(reducerTypes.CREATE_MINE_REPORT)));
};

export const fetchMineReports = (mineGuid) => (dispatch) => {
  dispatch(request(reducerTypes.GET_MINE_REPORTS));
  dispatch(showLoading());
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl}${API.MINE_REPORTS(mineGuid)}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_REPORTS));
      dispatch(mineReportActions.storeMineReports(response.data));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GET_MINE_REPORTS)))
    .finally(() => dispatch(hideLoading()));
};

export const updateMineReport = (mineGuid, mineReportGuid, payload) => (dispatch) => {
  dispatch(request(reducerTypes.UPDATE_MINE_REPORT));
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
    .catch(() => dispatch(error(reducerTypes.UPDATE_MINE_REPORT)));
};

export const createMineReportComment = (mineGuid, mineReportGuid, payload) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_MINE_REPORT_COMMENT));
  return CustomAxios()
    .post(
      `${ENVIRONMENT.apiUrl}${API.MINE_REPORT_COMMENTS(mineGuid, mineReportGuid)}`,
      payload,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Successfully added comment.",
        duration: 10,
      });
      dispatch(success(reducerTypes.CREATE_MINE_REPORT_COMMENT));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.CREATE_MINE_REPORT_COMMENT)));
};

export const updateMineReportComment = (
  mineGuid,
  mineReportGuid,
  mineReportCommentGuid,
  payload
) => (dispatch) => {
  dispatch(request(reducerTypes.UPDATE_MINE_REPORT_COMMENT));
  return CustomAxios()
    .put(
      `${ENVIRONMENT.apiUrl}${API.MINE_REPORT_COMMENT(
        mineGuid,
        mineReportGuid,
        mineReportCommentGuid
      )}`,
      payload,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Successfully updated comment.",
        duration: 10,
      });
      dispatch(success(reducerTypes.UPDATE_MINE_REPORT_COMMENT));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.UPDATE_MINE_REPORT_COMMENT)));
};

export const deleteMineReportComment = (mineGuid, mineReportGuid, mineReportCommentGuid) => (
  dispatch
) => {
  dispatch(request(reducerTypes.DELETE_MINE_REPORT_COMMENT));
  return CustomAxios()
    .delete(
      `${ENVIRONMENT.apiUrl}${API.deleteMineReportComment(
        mineGuid,
        mineReportGuid,
        mineReportCommentGuid
      )}`,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Successfully deleted comment.",
        duration: 10,
      });
      dispatch(success(reducerTypes.DELETE_MINE_REPORT_COMMENT));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.DELETE_MINE_REPORT_COMMENT)));
};
