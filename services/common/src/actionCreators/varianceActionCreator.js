import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { request, success, error } from "../actions/genericActions";
import * as reducerTypes from "../constants/reducerTypes";
import * as Strings from "../constants/strings";
import * as varianceActions from "../actions/varianceActions";
import * as API from "../constants/API";
import { ENVIRONMENT } from "@mds/common";
import { createRequestHeader } from "../utils/RequestHeaders";
import CustomAxios from "../customAxios";

export const createVariance = ({ mineGuid }, payload) => (dispatch) => {
  const message =
    payload.variance_application_status_code === Strings.VARIANCE_APPLICATION_CODE
      ? "Successfully applied for a new variance"
      : "Successfully added an approved variance";
  dispatch(request(reducerTypes.CREATE_MINE_VARIANCE));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .post(ENVIRONMENT.apiUrl + API.MINE_VARIANCES(mineGuid), payload, createRequestHeader())
    .then((response) => {
      notification.success({ message, duration: 10 });
      dispatch(success(reducerTypes.CREATE_MINE_VARIANCE));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.CREATE_MINE_VARIANCE));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const updateVariance = ({ mineGuid, varianceGuid, codeLabel }, payload) => (dispatch) => {
  dispatch(request(reducerTypes.UPDATE_MINE_VARIANCE));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .put(ENVIRONMENT.apiUrl + API.VARIANCE(mineGuid, varianceGuid), payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: `Successfully updated the variance application for: ${codeLabel}`,
        duration: 10,
      });
      dispatch(success(reducerTypes.UPDATE_MINE_VARIANCE));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.UPDATE_MINE_VARIANCE));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const fetchVariancesByMine = ({ mineGuid }) => (dispatch) => {
  dispatch(request(reducerTypes.GET_VARIANCES));
  dispatch(showLoading());
  return CustomAxios({ errorToastMessage: Strings.ERROR })
    .get(ENVIRONMENT.apiUrl + API.MINE_VARIANCES(mineGuid), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_VARIANCES));
      dispatch(varianceActions.storeVariances(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_VARIANCES)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchVarianceById = (mineGuid, varianceGuid) => (dispatch) => {
  dispatch(request(reducerTypes.GET_VARIANCE));
  dispatch(showLoading("modal"));
  return CustomAxios({ errorToastMessage: Strings.ERROR })
    .get(ENVIRONMENT.apiUrl + API.VARIANCE(mineGuid, varianceGuid), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_VARIANCE));
      dispatch(varianceActions.storeVariance(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_VARIANCE)))
    .finally(() => dispatch(hideLoading("modal")));
};

export const addDocumentToVariance = ({ mineGuid, varianceGuid }, payload) => (dispatch) => {
  dispatch(showLoading("modal"));
  dispatch(request(reducerTypes.ADD_DOCUMENT_TO_VARIANCE));
  return CustomAxios()
    .put(
      ENVIRONMENT.apiUrl + API.VARIANCE_DOCUMENTS(mineGuid, varianceGuid),
      payload,
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.ADD_DOCUMENT_TO_VARIANCE));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.ADD_DOCUMENT_TO_VARIANCE));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const removeDocumentFromVariance = (mineGuid, varianceGuid, mineDocumentGuid) => (
  dispatch
) => {
  dispatch(showLoading("modal"));
  dispatch(request(reducerTypes.REMOVE_DOCUMENT_FROM_VARIANCE));
  return CustomAxios()
    .delete(
      ENVIRONMENT.apiUrl + API.VARIANCE_DOCUMENT(mineGuid, varianceGuid, mineDocumentGuid),
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.REMOVE_DOCUMENT_FROM_VARIANCE));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.REMOVE_DOCUMENT_FROM_VARIANCE));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const fetchVariances = (payload) => (dispatch) => {
  dispatch(request(reducerTypes.GET_VARIANCES));
  dispatch(showLoading());
  return CustomAxios({ errorToastMessage: Strings.ERROR })
    .get(ENVIRONMENT.apiUrl + API.VARIANCES(payload), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_VARIANCES));
      dispatch(varianceActions.storeVariances(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_VARIANCES)))
    .finally(() => dispatch(hideLoading()));
};

export const deleteVariance = (mineGuid, varianceGuid) => (dispatch) => {
  dispatch(request(reducerTypes.DELETE_VARIANCE));
  dispatch(showLoading());
  return CustomAxios()
    .delete(`${ENVIRONMENT.apiUrl}${API.VARIANCE(mineGuid, varianceGuid)}`, createRequestHeader())
    .then((response) => {
      notification.success({
        message: "Successfully deleted variance.",
        duration: 10,
      });
      dispatch(success(reducerTypes.DELETE_VARIANCE));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.DELETE_VARIANCE));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading()));
};
