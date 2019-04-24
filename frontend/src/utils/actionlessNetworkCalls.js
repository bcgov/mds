import queryString from "query-string";
import CustomAxios from "@/customAxios";
import { createRequestHeader } from "@/utils/RequestHeaders";
import { ENVIRONMENT } from "@/constants/environment";
import { DOCUMENT_MANAGER_FILE_GET_URL } from "@/constants/API";

// const fileDownload = require("js-file-download");

const downloadFileFromDocumentManager = (docManagerGuid) => {
  if (!docManagerGuid) {
    throw new Error("Must provide docManagerGuid");
  }

  //   TODO: Update url when Document Manager moves to its own microservice.
  CustomAxios()
    .get(`${ENVIRONMENT.apiUrl}/document-manager/token/${docManagerGuid}`, createRequestHeader())
    .then((response) => {
      const url = `${ENVIRONMENT.apiUrl + DOCUMENT_MANAGER_FILE_GET_URL}?${queryString.stringify({
        token: response.data.token_guid,
      })}`;
      
      window.location = url

    //   const link = document.createElement("a");
    //   link.href = url;
    //   link.setAttribute("download", "");
    //   document.body.appendChild(link);
    //   link.click();
    //   document.body.removeChild(link);
    })
};

export default downloadFileFromDocumentManager;
