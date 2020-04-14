import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { error, request, success } from "@common/actions/genericActions";
import { ENVIRONMENT } from "@common/constants/environment";
import { createRequestHeader } from "@common/utils/RequestHeaders";
import CustomAxios from "@common/customAxios";
import * as COMMON_API from "@common/constants/API";
import * as API from "@/constants/API";
import * as reducerTypes from "@/constants/reducerTypes";
import * as documentActions from "@/actions/documentActions";

export const fetchNoticeOfWorkApplicationContextTemplate = (
  documentTypeCode,
  now_application_guid
) => (dispatch) => {
  dispatch(request(reducerTypes.GET_NOTICE_OF_WORK_APPLICATION_DOCUMENT_CONTEXT_TEMPLATE));
  dispatch(showLoading());
  return CustomAxios()
    .get(
      ENVIRONMENT.apiUrl +
        API.GET_NOTICE_OF_WORK_APPLICATION_DOCUMENT_CONTEXT_TEMPLATE(
          documentTypeCode,
          now_application_guid
        ),
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.GET_NOTICE_OF_WORK_APPLICATION_DOCUMENT_CONTEXT_TEMPLATE));
      dispatch(documentActions.storeDocumentContextTemplate(response.data));
      return response;
    })
    .catch(() =>
      dispatch(error(reducerTypes.GET_NOTICE_OF_WORK_APPLICATION_DOCUMENT_CONTEXT_TEMPLATE))
    )
    .finally(() => dispatch(hideLoading()));
};

export const generateNoticeOfWorkApplicationDocument = (
  documentTypeCode,
  payload,
  message = "Successfully generated Notice of Work document",
  onDocumentRetrieved = () => {}
) => (dispatch) => {
  dispatch(request(reducerTypes.GENERATE_NOTICE_OF_WORK_APPLICATION_DOCUMENT));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .post(
      `${ENVIRONMENT.apiUrl}${COMMON_API.NOW_APPLICATION_DOCUMENT_TYPE_OPTIONS}/${documentTypeCode}/generate`,
      payload,
      createRequestHeader()
    )
    .then((response) => {
      const token = { token: response.data.token };
      const docWindow = window.open(
        `${ENVIRONMENT.apiUrl + API.RETRIEVE_CORE_DOCUMENT(token)}`,
        "_blank"
      );
      docWindow.onbeforeunload = () => {
        notification.success({
          message,
          duration: 10,
        });
        dispatch(success(reducerTypes.GENERATE_NOTICE_OF_WORK_APPLICATION_DOCUMENT));
        onDocumentRetrieved();
      };
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GENERATE_NOTICE_OF_WORK_APPLICATION_DOCUMENT)))
    .finally(() => dispatch(hideLoading("modal")));
};

export default generateNoticeOfWorkApplicationDocument;
