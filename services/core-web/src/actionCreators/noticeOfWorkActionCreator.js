import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { error, request, success } from "@common/actions/genericActions";
import { ENVIRONMENT } from "@common/constants/environment";
import { createRequestHeader } from "@common/utils/RequestHeaders";
import CustomAxios from "@common/customAxios";
import * as API from "../constants/API";
import * as reducerTypes from "../constants/reducerTypes";

export const getNoticeOfWorkApplicationDocument = (documentTypeCode) =>
  `${ENVIRONMENT.apiUrl}${API.NOTICE_OF_WORK_APPLICATION_DOCUMENT_GENERATION(documentTypeCode)}`;

export const generateNoticeOfWorkApplicationDocument = (documentTypeCode, payload) => (
  dispatch
) => {
  dispatch(request(reducerTypes.GENERATE_NOTICE_OF_WORK_APPLICATION_DOCUMENT));
  dispatch(showLoading());
  return CustomAxios()
    .post(
      `${ENVIRONMENT.apiUrl}${API.NOTICE_OF_WORK_APPLICATION_DOCUMENT_GENERATION(
        documentTypeCode
      )}`,
      payload,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Successfully generated Notice of Work document",
        duration: 10,
      });
      dispatch(success(reducerTypes.GENERATE_NOTICE_OF_WORK_APPLICATION_DOCUMENT));

      console.log(response.data);
      const downloadUrl = window.URL.createObjectURL(
        new Blob(["\ufeff", response.data], {
          type: "application/octet-stream",
        })
      );

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", "file.doc");
      document.body.appendChild(link);
      link.click();
      link.remove();
      // console.log(response.data.file_name);
      // console.log(response.data.file_content);
      // const downloadUrl = window.URL.createObjectURL(
      //   new Blob([response.data.file_content], {
      //     type: "application/octet-stream;charset=utf-8",
      //   })
      // );
      // const link = document.createElement("a");
      // link.href = downloadUrl;
      // link.setAttribute("download", response.data.file_name);
      // document.body.appendChild(link);
      // link.click();
      // link.remove();
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GENERATE_NOTICE_OF_WORK_APPLICATION_DOCUMENT)))
    .finally(() => dispatch(hideLoading()));
};
