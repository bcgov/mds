import { notification } from "antd";
import { request, success, error } from "@/actions/genericActions";
import * as reducerTypes from "@/constants/reducerTypes";
import * as mineReportActions from "@/actions/mineReportActions";
import * as API from "@/constants/API";
import { ENVIRONMENT } from "@/constants/environment";
import { createRequestHeader } from "@/utils/RequestHeaders";
import CustomAxios from "@/customAxios";

export const fetchMineReportComments = (mineGuid, mineReportGuid) => (dispatch) => {
  dispatch(request(reducerTypes.GET_MINE_REPORT_COMMENTS));
  return CustomAxios()
    .get(
      `${ENVIRONMENT.apiUrl}${API.MINE_REPORT_COMMENTS(mineGuid, mineReportGuid)}`,
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_REPORT_COMMENTS));
      dispatch(mineReportActions.storeMineReportComments(response.data));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GET_MINE_REPORT_COMMENTS)));
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
      dispatch(success(reducerTypes.DELETE_MINE_REPORT_COMMENT));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.DELETE_MINE_REPORT_COMMENT)));
};
