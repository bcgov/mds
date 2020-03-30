import CustomAxios from "../customAxios";
import { createRequestHeader } from "./RequestHeaders";
import { ENVIRONMENT } from "../constants/environment";
import {
  DOCUMENT_MANAGER_FILE_GET_URL,
  DOCUMENT_MANAGER_TOKEN_GET_URL,
  NOTICE_OF_WORK_DOCUMENT_FILE_GET_URL,
  NOTICE_OF_WORK_DOCUMENT_TOKEN_GET_URL,
  NRIS_DOCUMENT_FILE_GET_URL,
  NRIS_DOCUMENT_TOKEN_GET_URL,
  MINE,
} from "../constants/API";

export const getMineWithoutStore = (mine_guid) => {
  return CustomAxios().get(`${ENVIRONMENT.apiUrl + MINE}/${mine_guid}`, createRequestHeader());
};

export const downloadNRISDocument = (externalId, inspectionId, fileName) => {
  if (!externalId) {
    throw new Error("Must provide externalId");
  }

  if (!inspectionId) {
    throw new Error("Must provide inspectionId");
  }

  if (!fileName) {
    throw new Error("Must provide fileName");
  }

  CustomAxios()
    .get(
      `${ENVIRONMENT.apiUrl + NRIS_DOCUMENT_TOKEN_GET_URL(externalId, inspectionId, fileName)}`,
      createRequestHeader()
    )
    .then((response) => {
      const token = { token: response.data.token_guid };
      if (fileName.toLowerCase().includes(".pdf")) {
        window.open(
          `${ENVIRONMENT.apiUrl + NRIS_DOCUMENT_FILE_GET_URL(externalId, inspectionId, token)}`,
          "_blank"
        );
      } else {
        window.location = `${ENVIRONMENT.apiUrl +
          NRIS_DOCUMENT_FILE_GET_URL(externalId, inspectionId, token)}`;
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

  CustomAxios()
    .get(
      `${ENVIRONMENT.apiUrl + NOTICE_OF_WORK_DOCUMENT_TOKEN_GET_URL(id, applicationGuid)}`,
      createRequestHeader()
    )
    .then((response) => {
      const token = { token: response.data.token_guid };
      if (fileName.toLowerCase().includes(".pdf")) {
        window.open(
          `${ENVIRONMENT.apiUrl +
            NOTICE_OF_WORK_DOCUMENT_FILE_GET_URL(id, applicationGuid, token)}`,
          "_blank"
        );
      } else {
        window.location = `${ENVIRONMENT.apiUrl +
          NOTICE_OF_WORK_DOCUMENT_FILE_GET_URL(id, applicationGuid, token)}`;
      }
    });
};

export const downloadFileFromDocumentManager = ({ document_manager_guid, document_name = "" }) => {
  if (!document_manager_guid) {
    throw new Error("Must provide document_manager_guid");
  }

  CustomAxios()
    .get(
      `${ENVIRONMENT.apiUrl + DOCUMENT_MANAGER_TOKEN_GET_URL(document_manager_guid)}`,
      createRequestHeader()
    )
    .then((response) => {
      const token = { token: response.data.token_guid };
      if (document_name.toLowerCase().includes(".pdf")) {
        window.open(`${ENVIRONMENT.docManUrl + DOCUMENT_MANAGER_FILE_GET_URL(token)}`, "_blank");
      } else {
        window.location = `${ENVIRONMENT.docManUrl + DOCUMENT_MANAGER_FILE_GET_URL(token)}`;
      }
    });
};

export const getDocumentDownloadToken = (document_manager_guid, filename, URLArray) => {
  if (!document_manager_guid) {
    throw new Error("Must provide document_manager_guid");
  }

  CustomAxios()
    .get(
      `${ENVIRONMENT.apiUrl + DOCUMENT_MANAGER_TOKEN_GET_URL(document_manager_guid)}`,
      createRequestHeader()
    )
    .then((response) => {
      const token = { token: response.data.token_guid };
      const URL = `${`${ENVIRONMENT.docManUrl +
        DOCUMENT_MANAGER_FILE_GET_URL(token)}&as_attachment=true`}`;
      URLArray.push({ filename, url: URL });
    });
};

export const getNowDocumentDownloadToken = (id, applicationGuid, filename, URLArray) => {
  if (!id) {
    throw new Error("Must provide id");
  }

  if (!applicationGuid) {
    throw new Error("Must provide applicationGuid");
  }

  CustomAxios()
    .get(
      `${ENVIRONMENT.apiUrl + NOTICE_OF_WORK_DOCUMENT_TOKEN_GET_URL(id, applicationGuid)}`,
      createRequestHeader()
    )
    .then((response) => {
      const token = { token: response.data.token_guid };
      const URL = `${ENVIRONMENT.apiUrl +
        NOTICE_OF_WORK_DOCUMENT_FILE_GET_URL(id, applicationGuid, token)}`;
      URLArray.push({ filename, url: URL });
    });
};
