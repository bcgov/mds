import * as ActionTypes from "../constants/actionTypes";

export const storeNoticesOfDeparture = (payload) => ({
  type: ActionTypes.STORE_NOTICES_OF_DEPARTURE,
  payload,
});

export const storeNoticeOfDeparture = (payload) => ({
  type: ActionTypes.STORE_NOTICE_OF_DEPARTURE,
  payload,
});


export const removeFileFromDocumentManager = ({ mine_guid, nod_guid, document_manager_guid, document_name = "" }) => {
  if (!document_manager_guid) {
    throw new Error("Must provide document_manager_guid");
  }

  return CustomAxios()
    .delete(
      `${ENVIRONMENT.docManUrl + NOTICES_OF_DEPARTURE_DOCUMENT(document_manager_guid)}`,
      createRequestHeader()
    )
    .then((response) => response.data);
};