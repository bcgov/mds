import CustomAxios from "@/customAxios";
import { createRequestHeader } from "@/utils/RequestHeaders";
import { ENVIRONMENT } from "@/constants/environment";
import { DOCUMENT_MANAGER_FILE_GET_URL, DOCUMENT_MANAGER_TOKEN_GET_URL } from "@/constants/API";


const downloadFileFromDocumentManager = (docManagerGuid) => {
  if (!docManagerGuid) {
    throw new Error("Must provide docManagerGuid");
  }

  // TODO: Update url when Document Manager moves to its own microservice.
  CustomAxios()
    .get(
      `${ENVIRONMENT.apiUrl + DOCUMENT_MANAGER_TOKEN_GET_URL(docManagerGuid)}`,
      createRequestHeader()
    )
    .then((response) => {
      const token = { token: response.data.token_guid };
      window.location = `${ENVIRONMENT.apiUrl + DOCUMENT_MANAGER_FILE_GET_URL(token)}`;
    });
};

export default downloadFileFromDocumentManager;
