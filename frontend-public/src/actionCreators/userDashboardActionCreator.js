import axios from "axios";
import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { request, success, error, clear } from "@/actions/genericActions";
import * as userMineInfoActions from "@/actions/userMineInfoActions";
import * as reducerTypes from "@/constants/reducerTypes";
import * as API from "@/constants/API";
import { ENVIRONMENT } from "@/constants/environment";
import { createRequestHeader } from "@/utils/RequestHeaders";

// This file is anticipated to have multiple exports
// eslint-disable-next-line import/prefer-default-export
export const fetchUserMineInfo = () => (dispatch) => {
  dispatch(showLoading());
  dispatch(request(reducerTypes.GET_MINE_INFO));
  return axios
    .get(`${ENVIRONMENT.apiUrl + API.MINE_NAME_LIST}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_INFO));
      dispatch(userMineInfoActions.storeUserMineInfo(response.data));
      dispatch(hideLoading());
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_MINE_INFO));
      dispatch(clear(reducerTypes.GET_MINE_INFO));
      dispatch(hideLoading());
    });
};

export const fetchMineRecordById = (mineId) => (dispatch) => {
  dispatch(showLoading());
  dispatch(request(reducerTypes.GET_MINE_RECORD));
  return axios
    .get(`${ENVIRONMENT.apiUrl + API.MINE}/${mineId}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_RECORD));
      dispatch(userMineInfoActions.storeMine(response.data));
      dispatch(hideLoading());
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_MINE_RECORD));
      dispatch(hideLoading());
    });
};

export const fetchExpectedDocumentStatusOptions = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_EXPECTED_DOCUMENT_STATUS));
  dispatch(showLoading("modal"));
  return axios
    .get(`${ENVIRONMENT.apiUrl + API.DOCUMENT_STATUS}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_EXPECTED_DOCUMENT_STATUS));
      dispatch(userMineInfoActions.storeDocumentStatusOptions(response.data));
      dispatch(hideLoading("modal"));
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_EXPECTED_DOCUMENT_STATUS));
      dispatch(hideLoading("modal"));
    });
};

export const fetchMineDocuments = (mineGuid) => (dispatch) => {
  dispatch(request(reducerTypes.GET_MINE_DOCUMENTS));
  dispatch(showLoading());
  return axios
    .get(`${ENVIRONMENT.apiUrl}${API.MINE_DOCUMENTS}/${mineGuid}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_DOCUMENTS));
      dispatch(userMineInfoActions.storeMineDocuments(response.data));
      dispatch(hideLoading());
      return response;
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_MINE_DOCUMENTS));
      dispatch(hideLoading());
    });
};

export const addMineDocumentToExpectedDocument = (expectedDocumentGuid, payload) => (dispatch) => {
  dispatch(showLoading());
  dispatch(request(reducerTypes.ADD_MINE_DOCUMENT_TO_EXPECTED_DOCUMENT));
  return axios
    .post(
      ENVIRONMENT.apiUrl + API.UPLOAD_MINE_EXPECTED_DOCUMENT_FILE(expectedDocumentGuid),
      payload,
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.ADD_MINE_DOCUMENT_TO_EXPECTED_DOCUMENT));
      dispatch(hideLoading());
      return response;
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.ADD_MINE_DOCUMENT_TO_EXPECTED_DOCUMENT));
      dispatch(hideLoading());
    });
};

export const updateExpectedDocument = (id, payload) => (dispatch) => {
  dispatch(request(reducerTypes.UPDATE_EXPECTED_DOCUMENT));
  dispatch(showLoading("modal"));
  return axios
    .put(`${ENVIRONMENT.apiUrl + API.EXPECTED_DOCUMENT}/${id}`, payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: "Successfully updated expected document",
        duration: 10,
      });
      dispatch(success(reducerTypes.UPDATE_EXPECTED_DOCUMENT));
      dispatch(hideLoading("modal"));
      return response;
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.UPDATE_EXPECTED_DOCUMENT));
      dispatch(hideLoading("modal"));
    });
};

export const removeMineDocumentFromExpectedDocument = (mineDocumentGuid, expectedDocumentGuid) => (
  dispatch
) => {
  dispatch(request(reducerTypes.REMOVE_MINE_EXPECTED_DOCUMENT));
  dispatch(showLoading());
  return axios
    .delete(
      ENVIRONMENT.apiUrl +
        API.REMOVE_MINE_EXPECTED_DOCUMENT(expectedDocumentGuid, mineDocumentGuid),
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Successfully removed the document from the report.",
        duration: 10,
      });
      dispatch(success(reducerTypes.REMOVE_MINE_EXPECTED_DOCUMENT));
      dispatch(hideLoading());
      return response;
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.REMOVE_MINE_EXPECTED_DOCUMENT));
      dispatch(hideLoading());
    });
};
