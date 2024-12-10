import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import { request, success, error } from "../actions/genericActions";
import { NetworkReducerTypes } from "@mds/common/constants/networkReducerTypes";
import * as mineReportActions from "../actions/mineReportActions";
import * as API from "@mds/common/constants/API";
import { createRequestHeader } from "../utils/RequestHeaders";
import CustomAxios from "../customAxios";

export const fetchMineReportComments = (mineGuid, mineReportGuid) => (dispatch) => {
  dispatch(request(NetworkReducerTypes.GET_MINE_REPORT_COMMENTS));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .get(
      `${ENVIRONMENT.apiUrl}${API.MINE_REPORT_COMMENTS(mineGuid, mineReportGuid)}`,
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(NetworkReducerTypes.GET_MINE_REPORT_COMMENTS));
      dispatch(mineReportActions.storeMineReportComments(response.data));
      return response;
    })
    .catch(() => dispatch(error(NetworkReducerTypes.GET_MINE_REPORT_COMMENTS)))
    .finally(() => dispatch(hideLoading("modal")));
};

export const createMineReportComment = (mineGuid, mineReportGuid, payload) => (dispatch) => {
  dispatch(request(NetworkReducerTypes.CREATE_MINE_REPORT_COMMENT));
  dispatch(showLoading("modal"));
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
      dispatch(success(NetworkReducerTypes.CREATE_MINE_REPORT_COMMENT));
      return response;
    })
    .catch(() => dispatch(error(NetworkReducerTypes.CREATE_MINE_REPORT_COMMENT)))
    .finally(() => dispatch(hideLoading("modal")));
};

export const updateMineReportComment = (
  mineGuid,
  mineReportGuid,
  mineReportCommentGuid,
  payload
) => (dispatch) => {
  dispatch(request(NetworkReducerTypes.UPDATE_MINE_REPORT_COMMENT));
  dispatch(showLoading("modal"));
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
      dispatch(success(NetworkReducerTypes.UPDATE_MINE_REPORT_COMMENT));
      return response;
    })
    .catch(() => dispatch(error(NetworkReducerTypes.UPDATE_MINE_REPORT_COMMENT)))
    .finally(() => dispatch(hideLoading("modal")));
};

export const deleteMineReportComment = (mineGuid, mineReportGuid, mineReportCommentGuid) => (
  dispatch
) => {
  dispatch(request(NetworkReducerTypes.DELETE_MINE_REPORT_COMMENT));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .delete(
      `${ENVIRONMENT.apiUrl}${API.MINE_REPORT_COMMENT(
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
      dispatch(success(NetworkReducerTypes.DELETE_MINE_REPORT_COMMENT));
      return response;
    })
    .catch(() => dispatch(error(NetworkReducerTypes.DELETE_MINE_REPORT_COMMENT)))
    .finally(() => dispatch(hideLoading("modal")));
};
