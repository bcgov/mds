import { ENVIRONMENT } from "@mds/common";
import CustomAxios from "../customAxios";
import { createRequestHeader } from "./RequestHeaders";
import {
  DOCUMENT_MANAGER_DOCUMENT,
  DOCUMENT_MANAGER_FILE_GET_URL,
  DOCUMENT_MANAGER_TOKEN_GET_URL,
  NOTICE_OF_WORK_DOCUMENT_FILE_GET_URL,
  NOTICE_OF_WORK_DOCUMENT_TOKEN_GET_URL,
  NRIS_DOCUMENT_FILE_GET_URL,
  NRIS_DOCUMENT_TOKEN_GET_URL,
  MINE,
} from "../constants/API";

export const getMineWithoutStore = (mine_guid) => {
  return CustomAxios().get(`${ENVIRONMENT.apiUrl}${MINE}/${mine_guid}`, createRequestHeader());
};

export const downloadNrisDocument = (externalId, inspectionId, fileName) => {
  if (!externalId) {
    throw new Error("Must provide externalId");
  }

  if (!inspectionId) {
    throw new Error("Must provide inspectionId");
  }

  if (!fileName) {
    throw new Error("Must provide fileName");
  }

  return CustomAxios()
    .get(
      `${ENVIRONMENT.apiUrl}${NRIS_DOCUMENT_TOKEN_GET_URL(externalId, inspectionId, fileName)}`,
      createRequestHeader()
    )
    .then((response) => {
      const token = { token: response.data.token_guid };
      const url = `${ENVIRONMENT.apiUrl}${NRIS_DOCUMENT_FILE_GET_URL(
        externalId,
        inspectionId,
        token
      )}`;
      if (fileName.toLowerCase().includes(".pdf")) {
        window.open(url, "_blank");
      } else {
        // @ts-ignore
        window.location = url;
      }
    });
};

export const downloadNowDocument = (id, applicationGuid, fileName) => {
  if (!id) {
    throw new Error("Must provide id");
  }

  if (!applicationGuid) {
    throw new Error("Must provide applicationGuid");
  }

  if (!fileName) {
    throw new Error("Must provide fileName");
  }

  return CustomAxios()
    .get(
      `${ENVIRONMENT.apiUrl}${NOTICE_OF_WORK_DOCUMENT_TOKEN_GET_URL(id, applicationGuid)}`,
      createRequestHeader()
    )
    .then((response) => {
      const token = { token: response.data.token_guid };
      const url = `${ENVIRONMENT.apiUrl}${NOTICE_OF_WORK_DOCUMENT_FILE_GET_URL(
        id,
        applicationGuid,
        token
      )}`;
      if (fileName.toLowerCase().includes(".pdf")) {
        window.open(url, "_blank");
      } else {
        // @ts-ignore
        window.location = url;
      }
    });
};

export const downloadFileFromDocumentManager = (props) => {
  const { document_manager_guid, document_name = "", document_manager_version_guid } = props;
  if (!document_manager_guid) {
    throw new Error("Must provide document_manager_guid");
  }

  return CustomAxios()
    .get(
      `${ENVIRONMENT.apiUrl + DOCUMENT_MANAGER_TOKEN_GET_URL(document_manager_guid)}`,
      createRequestHeader()
    )
    .then((response) => {
      const token = { token: response.data.token_guid };
      let url = `${ENVIRONMENT.docManUrl + DOCUMENT_MANAGER_FILE_GET_URL(token)}`;

      if (document_manager_version_guid) {
        url = `${url}&document_manager_version_guid=${document_manager_version_guid}`;
      }

      if (document_name.toLowerCase().includes(".pdf")) {
        window.open(url, "_blank");
      } else {
        // @ts-ignore
        window.location = url;
      }
    });
};

export const getDocumentDownloadToken = (documentManagerGuid, filename, UrlArray) => {
  if (!documentManagerGuid) {
    throw new Error("Must provide documentManagerGuid");
  }

  return CustomAxios()
    .get(
      `${ENVIRONMENT.apiUrl + DOCUMENT_MANAGER_TOKEN_GET_URL(documentManagerGuid)}`,
      createRequestHeader()
    )
    .then((response) => {
      const token = { token: response.data.token_guid };
      const url = `${`${ENVIRONMENT.docManUrl +
        DOCUMENT_MANAGER_FILE_GET_URL(token)}&as_attachment=true`}`;
      UrlArray.push({ filename, url });
    });
};

export const getDocument = (documentManagerGuid) => {
  return CustomAxios()
    .get(
      `${ENVIRONMENT.docManUrl + DOCUMENT_MANAGER_DOCUMENT(documentManagerGuid)}`,
      createRequestHeader()
    )
    .then((response) => response.data);
};
