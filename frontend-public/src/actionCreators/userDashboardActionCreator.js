import axios from "axios";
import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { request, success, error } from "@/actions/genericActions";
import * as userMineActions from "@/actions/userMineActions";
import * as reducerTypes from "@/constants/reducerTypes";
import * as API from "@/constants/API";
import { ENVIRONMENT } from "@/constants/environment";
import { createRequestHeader } from "@/utils/RequestHeaders";

export const fetchUserMineInfo = () => (dispatch) => {
  dispatch(showLoading());
  dispatch(request(reducerTypes.GET_USER_MINE_INFO));
  return axios
    .get(`${ENVIRONMENT.apiUrl + API.USER_MINE_INFO}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_USER_MINE_INFO));
      dispatch(userMineActions.storeUserMineInfo(response.data));
      dispatch(hideLoading());
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_USER_MINE_INFO));
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
      dispatch(userMineActions.storeMine(response.data));
      dispatch(hideLoading());
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_MINE_RECORD));
      dispatch(hideLoading());
    });
};

export const fetchMineDocuments = (mineGuid) => (dispatch) => {
  dispatch(request(reducerTypes.GET_MINE_DOCUMENTS));
  dispatch(showLoading());
  return axios
    .get(`${ENVIRONMENT.apiUrl}${API.MINE_DOCUMENTS(mineGuid)}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_DOCUMENTS));
      dispatch(userMineActions.storeMineDocuments(response.data));
      dispatch(hideLoading());
      return response;
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_MINE_DOCUMENTS));
      dispatch(hideLoading());
    });
};

export const addDocumentToExpectedDocument = (expectedDocumentGuid, payload) => (dispatch) => {
  dispatch(showLoading());
  dispatch(request(reducerTypes.ADD_DOCUMENT_TO_EXPECTED_DOCUMENT));
  return axios
    .put(
      ENVIRONMENT.apiUrl + API.UPLOAD_MINE_EXPECTED_DOCUMENT_FILE(expectedDocumentGuid),
      payload,
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.ADD_DOCUMENT_TO_EXPECTED_DOCUMENT));
      dispatch(hideLoading());
      return response;
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.ADD_DOCUMENT_TO_EXPECTED_DOCUMENT));
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
        message: err.response ? err.response.data.message : String.ERROR,
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
        message: err.response ? err.response.data.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.REMOVE_MINE_EXPECTED_DOCUMENT));
      dispatch(hideLoading());
    });
};
