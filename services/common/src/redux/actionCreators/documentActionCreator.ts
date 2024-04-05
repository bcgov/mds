import { AppThunk } from "@mds/common/interfaces/appThunk.type";
import { AxiosResponse } from "axios";

import * as reducerTypes from "@mds/common/constants/reducerTypes";
import { hideLoading, showLoading } from "react-redux-loading-bar";

import { notification } from "antd";
import { ENVIRONMENT } from "@mds/common/constants";
import { IMineDocumentVersion } from "@mds/common/interfaces";
import { error, request, success } from "@mds/common/redux/actions/genericActions";
import CustomAxios from "@mds/common/redux/customAxios";
import * as API from "@mds/common/constants/API";
import * as documentActions from "@mds/common/redux/actions/documentActions";

const createRequestHeader = REQUEST_HEADER.createRequestHeader;

export const postNewDocumentVersion = ({
  mineGuid,
  mineDocumentGuid,
  documentManagerVersionGuid,
}: {
  mineGuid: string;
  mineDocumentGuid: string;
  documentManagerVersionGuid: string;
}): AppThunk<Promise<AxiosResponse<IMineDocumentVersion>>> => (
  dispatch
): Promise<AxiosResponse<IMineDocumentVersion>> => {
  dispatch(request(reducerTypes.POST_NEW_DOCUMENT_VERSION));
  dispatch(showLoading());

  const payload = { document_manager_version_guid: documentManagerVersionGuid };

  return CustomAxios()
    .post(
      `${ENVIRONMENT.apiUrl}/mines/${mineGuid}/documents/${mineDocumentGuid}/versions`,
      payload,
      createRequestHeader()
    )
    .then((response: AxiosResponse<IMineDocumentVersion>) => {
      notification.success({
        message: "Successfully created new document version",
        duration: 10,
      });
      dispatch(success(reducerTypes.POST_NEW_DOCUMENT_VERSION));
      return response;
    })
    .catch(() => {
      dispatch(error(reducerTypes.POST_NEW_DOCUMENT_VERSION));
    })
    .finally(() => {
      dispatch(hideLoading());
    });
};

export const pollDocumentUploadStatus = (
  mine_document_guid: string
): AppThunk<Promise<AxiosResponse<IMineDocumentVersion>>> => (
  dispatch
): Promise<AxiosResponse<IMineDocumentVersion>> => {
  dispatch(request(reducerTypes.POLL_DOCUMENT_UPLOAD_STATUS));
  dispatch(showLoading());

  return CustomAxios()
    .get(
      `${ENVIRONMENT.apiUrl}/mines/documents/upload/${mine_document_guid}`,
      createRequestHeader()
    )
    .then((response: AxiosResponse<IMineDocumentVersion>) => {
      dispatch(success(reducerTypes.POLL_DOCUMENT_UPLOAD_STATUS));
      return response;
    })
    .catch(() => {
      dispatch(error(reducerTypes.POLL_DOCUMENT_UPLOAD_STATUS));
    })
    .finally(() => {
      dispatch(hideLoading());
    });
};

export const documentsCompression = (mineGuid, documentManagerGuids) => (dispatch) => {
  dispatch(request(reducerTypes.DOCUMENTS_COMPRESSION));
  dispatch(showLoading());
  return CustomAxios()
    .post(
      `${ENVIRONMENT.apiUrl}${API.DOCUMENTS_COMPRESSION(mineGuid)}`,
      { document_manager_guids: documentManagerGuids },
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.DOCUMENTS_COMPRESSION));
      return response;
    })
    .catch(() => {
      dispatch(error(reducerTypes.DOCUMENTS_COMPRESSION));
    })
    .finally(() => dispatch(hideLoading()));
};

export const pollDocumentsCompressionProgress = (taskId) => (dispatch) => {
  dispatch(request(reducerTypes.POLL_DOCUMENTS_COMPRESSION_PROGRESS));
  dispatch(showLoading());
  return CustomAxios()
    .get(
      `${ENVIRONMENT.apiUrl}${API.POLL_DOCUMENTS_COMPRESSION_PROGRESS(taskId)}`,
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.POLL_DOCUMENTS_COMPRESSION_PROGRESS));
      dispatch(documentActions.storeDocumentCompressionProgress(response.data));
      return response;
    })
    .catch(() => {
      dispatch(error(reducerTypes.POLL_DOCUMENTS_COMPRESSION_PROGRESS));
    })
    .finally(() => dispatch(hideLoading()));
};
