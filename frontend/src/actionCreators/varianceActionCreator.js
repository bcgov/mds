import axios from "axios";
import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { request, success, error } from "@/actions/genericActions";
import * as reducerTypes from "@/constants/reducerTypes";
import * as String from "@/constants/strings";
import * as varianceActions from "@/actions/varianceActions";
import * as API from "@/constants/API";
import { ENVIRONMENT } from "@/constants/environment";
import { createRequestHeader } from "@/utils/RequestHeaders";

export const createVariance = (payload, mineGuid) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_MINE_VARIANCE));
  dispatch(showLoading());
  return axios
    .post(ENVIRONMENT.apiUrl + API.VARIANCE(mineGuid), payload, createRequestHeader())
    .then((response) => {
      dispatch(hideLoading());
      notification.success({ message: "Successfully created a new variance", duration: 10 });
      dispatch(success(reducerTypes.CREATE_MINE_VARIANCE));
      return response;
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.CREATE_MINE_VARIANCE));
      dispatch(hideLoading());
    });
};

const fetchDocumentsForEachVariance = (response) =>
  Promise.all(
    response.data.records.map(({ variance_id }) =>
      axios.get(ENVIRONMENT.apiUrl + API.VARIANCE_DOCUMENTS(variance_id), createRequestHeader())
    )
  );

const byVarianceId = (varianceId) => (documentsByVariance) =>
  documentsByVariance.data.records[0]
    ? documentsByVariance.data.records[0].variance_id === varianceId
    : false;

const addDocumentsListToVariance = (documents, record) =>
  documents.filter(byVarianceId(record.variance_id)).map(({ data: { records } }) => records)[0];

const addDocumentsListToVariances = (response, documents) =>
  response.data.records.map((record) => ({
    ...record,
    documents: addDocumentsListToVariance(documents, record),
  }));

const addDocumentsListToEachVariance = async (response) => {
  const documents = await fetchDocumentsForEachVariance(response);
  const variancesWithDocuments = addDocumentsListToVariances(response, documents);
  return { records: variancesWithDocuments };
};

export const fetchVariancesByMine = (mineGuid) => (dispatch) => {
  dispatch(request(reducerTypes.GET_MINE_VARIANCES));
  dispatch(showLoading());
  return axios
    .get(ENVIRONMENT.apiUrl + API.VARIANCE(mineGuid), createRequestHeader())
    .then(addDocumentsListToEachVariance)
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_VARIANCES));
      dispatch(varianceActions.storeVariances(response));
      dispatch(hideLoading());
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_MINE_VARIANCES));
      dispatch(hideLoading());
    });
};

export const addDocumentToVariance = (varianceId, payload) => (dispatch) => {
  dispatch(showLoading());
  dispatch(request(reducerTypes.ADD_DOCUMENT_TO_VARIANCE));
  return axios
    .put(ENVIRONMENT.apiUrl + API.VARIANCE_DOCUMENT(varianceId), payload, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.ADD_DOCUMENT_TO_VARIANCE));
      dispatch(hideLoading());
      return response;
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.ADD_DOCUMENT_TO_VARIANCE));
      dispatch(hideLoading());
    });
};

export const removeDocumentFromVariance = (varianceId, mineDocumentGuid) => (dispatch) => {
  dispatch(showLoading());
  dispatch(request(reducerTypes.REMOVE_DOCUMENT_FROM_VARIANCE));
  return axios
    .delete(
      ENVIRONMENT.apiUrl + API.VARIANCE_DOCUMENT_RECORD(varianceId, mineDocumentGuid),
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.REMOVE_DOCUMENT_FROM_VARIANCE));
      dispatch(hideLoading());
      return response;
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.REMOVE_DOCUMENT_FROM_VARIANCE));
      dispatch(hideLoading());
    });
};
