import axios from "axios";
import { notification } from "antd";
import { createRequestHeader } from "@/utils/RequestHeaders";
import { ENVIRONMENT } from "@/constants/environment";
import { DOCUMENT_MANAGER_FILE_GET_URL } from "@/constants/API";

const fileDownload = require("js-file-download");

const downloadFileFromDocumentManager = (docManagerGuid, filename) => {
  if (!docManagerGuid || !filename) {
    throw new Error("Must provide both docManagerGuid and filename");
  }

  // TODO: Update url when Document Manager moves to its own microservice.
  const url = `${ENVIRONMENT.apiUrl + DOCUMENT_MANAGER_FILE_GET_URL}/${docManagerGuid}`;
  axios
    .get(url, { responseType: "arraybuffer", ...createRequestHeader() })
    .then((response) => {
      fileDownload(response.data, filename);
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
    });
};

export default downloadFileFromDocumentManager;
