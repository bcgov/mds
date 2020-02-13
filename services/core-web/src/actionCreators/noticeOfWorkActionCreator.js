import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { error, request, success } from "@common/actions/genericActions";
import * as API from "../constants/API";
import { ENVIRONMENT } from "@common/constants/environment";
import { createRequestHeader } from "@common/utils/RequestHeaders";
import CustomAxios from "@common/customAxios";
import * as reducerTypes from "../constants/reducerTypes";

export const generateNoticeOfWorkApplicationDocument = (documentTypeCode, payload) => (
  dispatch
) => {
  dispatch(request(reducerTypes.GENERATE_NOTICE_OF_WORK_APPLICATION_DOCUMENT));
  dispatch(showLoading());
  return CustomAxios()
    .get(
      `${ENVIRONMENT.apiUrl}${API.NOTICE_OF_WORK_APPLICATION_DOCUMENT_GENERATION(
        documentTypeCode
      )}`,
      payload,
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          //   "Content-Disposition": "attachment",
          //   Accept: "application/event-stream",
        },
      }
    )
    .then((response) => {
      notification.success({
        message: "Successfully generated Notice of Work document",
        duration: 10,
      });
      dispatch(success(reducerTypes.GENERATE_NOTICE_OF_WORK_APPLICATION_DOCUMENT));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GENERATE_NOTICE_OF_WORK_APPLICATION_DOCUMENT)))
    .finally(() => dispatch(hideLoading()));
};
