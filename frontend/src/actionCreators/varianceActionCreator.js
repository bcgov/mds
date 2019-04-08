import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { request, success, error } from "@/actions/genericActions";
import * as reducerTypes from "@/constants/reducerTypes";
import * as String from "@/constants/strings";
import * as varianceActions from "@/actions/varianceActions";
import * as API from "@/constants/API";
import { ENVIRONMENT } from "@/constants/environment";
import { createRequestHeader } from "@/utils/RequestHeaders";
import CustomAxios from "@/customAxios";

export const createVariance = ({ mineGuid }, payload) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_MINE_VARIANCE));
  dispatch(showLoading());
  return CustomAxios()
    .post(ENVIRONMENT.apiUrl + API.VARIANCES(mineGuid), payload, createRequestHeader())
    .then((response) => {
      dispatch(hideLoading());
      notification.success({ message: "Successfully created a new variance", duration: 10 });
      dispatch(success(reducerTypes.CREATE_MINE_VARIANCE));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.CREATE_MINE_VARIANCE)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchVariancesByMine = ({ mineGuid }) => (dispatch) => {
  dispatch(request(reducerTypes.GET_MINE_VARIANCES));
  dispatch(showLoading());
  return CustomAxios(String.ERROR)
    .get(ENVIRONMENT.apiUrl + API.VARIANCES(mineGuid), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_VARIANCES));
      dispatch(varianceActions.storeVariances(response.data));
      dispatch(hideLoading());
    })
    .catch(() => dispatch(error(reducerTypes.GET_MINE_VARIANCES)))
    .finally(() => dispatch(hideLoading()));
};

export const addDocumentToVariance = ({ mineGuid, varianceId }, payload) => (dispatch) => {
  dispatch(showLoading());
  dispatch(request(reducerTypes.ADD_DOCUMENT_TO_VARIANCE));
  return CustomAxios()
    .put(
      ENVIRONMENT.apiUrl + API.VARIANCE_DOCUMENTS(mineGuid, varianceId),
      payload,
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.ADD_DOCUMENT_TO_VARIANCE));
      dispatch(hideLoading());
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.ADD_DOCUMENT_TO_VARIANCE)))
    .finally(() => dispatch(hideLoading()));
};

export const removeDocumentFromVariance = ({ mineGuid, varianceId, mineDocumentGuid }) => (
  dispatch
) => {
  dispatch(showLoading());
  dispatch(request(reducerTypes.REMOVE_DOCUMENT_FROM_VARIANCE));
  return CustomAxios()
    .delete(
      ENVIRONMENT.apiUrl + API.VARIANCE_DOCUMENT(mineGuid, varianceId, mineDocumentGuid),
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.REMOVE_DOCUMENT_FROM_VARIANCE));
      dispatch(hideLoading());
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.REMOVE_DOCUMENT_FROM_VARIANCE)))
    .finally(() => dispatch(hideLoading()));
};
