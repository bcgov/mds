import { AppThunk } from "@/store/appThunk.type";
import { AxiosResponse } from "axios";
import { error, request, success } from "@common/actions/genericActions";
import * as reducerTypes from "@common/constants/reducerTypes";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import CustomAxios from "@common/customAxios";
import { createRequestHeader } from "@common/utils/RequestHeaders";
import { notification } from "antd";
import { ENVIRONMENT, IMineDocumentVersion } from "@mds/common";

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
    .catch((err) => {
      dispatch(error(reducerTypes.POST_NEW_DOCUMENT_VERSION));
      throw new Error(err);
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
    .catch((err) => {
      dispatch(error(reducerTypes.POLL_DOCUMENT_UPLOAD_STATUS));
      throw new Error(err);
    })
    .finally(() => {
      dispatch(hideLoading());
    });
};
