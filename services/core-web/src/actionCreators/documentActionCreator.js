/* eslint-disable */
import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { error, request, success } from "@common/actions/genericActions";
import { ENVIRONMENT } from "@mds/common";
import { createRequestHeader } from "@common/utils/RequestHeaders";
import CustomAxios from "@common/customAxios";
import * as COMMON_API from "@common/constants/API";
import * as API from "@/constants/API";
import * as reducerTypes from "@/constants/reducerTypes";
import * as documentActions from "@/actions/documentActions";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";

// Notice of Work

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
    .catch((err) => {
      dispatch(error(reducerTypes.GET_NOTICE_OF_WORK_APPLICATION_DOCUMENT_CONTEXT_TEMPLATE));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading()));
};

export const generateNoticeOfWorkApplicationDocument = (
  documentTypeCode,
  payload,
  message = "Successfully generated Notice of Work document",
  isPreview = false,
  onDocumentGenerated = () => {}
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
      const params = { token: response.data.token, return_record: "true", is_preview: isPreview };
      if (isPreview) {
        window.open(`${ENVIRONMENT.apiUrl + API.NOW_DOCUMENT_GENERATION(params)}`, "_blank");
      } else {
        return CustomAxios()
          .get(`${ENVIRONMENT.apiUrl + API.NOW_DOCUMENT_GENERATION(params)}`, createRequestHeader())
          .then((response) => {
            notification.success({
              message,
              duration: 10,
            });
            const mineDocument = response.data.mine_document;
            dispatch(success(reducerTypes.GENERATE_NOTICE_OF_WORK_APPLICATION_DOCUMENT));
            downloadFileFromDocumentManager(mineDocument);
            onDocumentGenerated();
          })
          .catch((err) => {
            dispatch(error(reducerTypes.GENERATE_NOTICE_OF_WORK_APPLICATION_DOCUMENT));
            throw new Error(err);
          });
      }
    })
    .catch((err) => {
      dispatch(error(reducerTypes.GENERATE_NOTICE_OF_WORK_APPLICATION_DOCUMENT));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const exportNoticeOfWorkApplicationDocument = (
  documentTypeCode,
  payload,
  message = "Successfully exported Notice of Work document",
  onDocumentGenerated = () => {}
) => (dispatch) => {
  dispatch(request(reducerTypes.EXPORT_NOTICE_OF_WORK_APPLICATION_DOCUMENT));
  dispatch(showLoading());
  return CustomAxios()
    .post(
      `${ENVIRONMENT.apiUrl}${COMMON_API.NOW_APPLICATION_EXPORT_DOCUMENT_TYPE_OPTIONS}/${documentTypeCode}`,
      payload,
      createRequestHeader()
    )
    .then((response) => {
      const params = { token: response.data.token, return_record: "true" };
      return CustomAxios()
        .get(`${ENVIRONMENT.apiUrl + API.NOW_DOCUMENT_GENERATION(params)}`, createRequestHeader())
        .then((response) => {
          const mineDocument = response.data.mine_document;
          notification.success({
            message,
            duration: 10,
          });
          dispatch(success(reducerTypes.EXPORT_NOTICE_OF_WORK_APPLICATION_DOCUMENT));
          downloadFileFromDocumentManager(mineDocument);
          onDocumentGenerated();
        })
        .catch((err) => {
          dispatch(error(reducerTypes.EXPORT_NOTICE_OF_WORK_APPLICATION_DOCUMENT));
          throw new Error(err);
        });
    })
    .catch((err) => {
      dispatch(error(reducerTypes.EXPORT_NOTICE_OF_WORK_APPLICATION_DOCUMENT));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading()));
};

// Explosives Permit

export const fetchExplosivesPermitDocumentContextTemplate = (
  documentTypeCode,
  explosives_permit_guid
) => (dispatch) => {
  dispatch(request(reducerTypes.GET_EXPLOSIVES_PERMIT_DOCUMENT_CONTEXT_TEMPLATE));
  dispatch(showLoading());
  return CustomAxios()
    .get(
      ENVIRONMENT.apiUrl +
        API.GET_EXPLOSIVES_PERMIT_DOCUMENT_CONTEXT_TEMPLATE(
          documentTypeCode,
          explosives_permit_guid
        ),
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.GET_EXPLOSIVES_PERMIT_DOCUMENT_CONTEXT_TEMPLATE));
      dispatch(documentActions.storeDocumentContextTemplate(response.data));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.GET_EXPLOSIVES_PERMIT_DOCUMENT_CONTEXT_TEMPLATE));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading()));
};

export const generateExplosivesPermitDocument = (
  documentTypeCode,
  payload,
  message = "Successfully generated Explosives Permit document",
  isPreview = false,
  onDocumentGenerated = () => {}
) => (dispatch) => {
  dispatch(request(reducerTypes.GENERATE_EXPLOSIVES_PERMIT_DOCUMENT));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .post(
      `${ENVIRONMENT.apiUrl}${COMMON_API.EXPLOSIVES_PERMIT_DOCUMENT_TYPE_OPTIONS}/${documentTypeCode}/generate`,
      payload,
      createRequestHeader()
    )
    .then((response) => {
      const params = { token: response.data.token, return_record: "true", is_preview: isPreview };
      if (isPreview) {
        window.open(
          `${ENVIRONMENT.apiUrl + API.EXPLOSIVES_PERMIT_DOCUMENT_GENERATION(params)}`,
          "_blank"
        );
      } else {
        return CustomAxios()
          .get(
            `${ENVIRONMENT.apiUrl + API.EXPLOSIVES_PERMIT_DOCUMENT_GENERATION(params)}`,
            createRequestHeader()
          )
          .then((response) => {
            notification.success({
              message,
              duration: 10,
            });
            const mineDocument = response.data.mine_document;
            dispatch(success(reducerTypes.GENERATE_EXPLOSIVES_PERMIT_DOCUMENT));
            downloadFileFromDocumentManager(mineDocument);
            onDocumentGenerated();
          })
          .catch((err) => {
            dispatch(error(reducerTypes.GENERATE_EXPLOSIVES_PERMIT_DOCUMENT));
            throw new Error(err);
          });
      }
    })
    .catch((err) => {
      dispatch(error(reducerTypes.GENERATE_EXPLOSIVES_PERMIT_DOCUMENT));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading("modal")));
};
