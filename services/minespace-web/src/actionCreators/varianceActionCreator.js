import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { request, success, error } from "@/actions/genericActions";
import * as reducerTypes from "@/constants/reducerTypes";
import * as Strings from "@/constants/strings";
import * as varianceActions from "@/actions/varianceActions";
import * as API from "@/constants/API";
import { ENVIRONMENT } from "@common/constants/environment";
import { createRequestHeader } from "@/utils/RequestHeaders";
import CustomAxios from "@/utils/customAxios";

export const createVariance = ({ mineGuid, mineName }, payload) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_MINE_VARIANCE));
  dispatch(showLoading());
  return CustomAxios()
    .post(ENVIRONMENT.apiUrl + API.VARIANCES(mineGuid), payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: `Successfully applied for a variance for ${mineName}`,
        duration: 10,
      });
      dispatch(success(reducerTypes.CREATE_MINE_VARIANCE));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.CREATE_MINE_VARIANCE)))
    .finally(() => dispatch(hideLoading()));
};

export const updateVariance = ({ mineGuid, varianceGuid, codeLabel }, payload) => (dispatch) => {
  dispatch(request(reducerTypes.UPDATE_MINE_VARIANCE));
  dispatch(showLoading());
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
    .catch(() => dispatch(error(reducerTypes.UPDATE_MINE_VARIANCE)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchVariancesByMine = ({ mineGuid }) => (dispatch) => {
  dispatch(request(reducerTypes.GET_MINE_VARIANCES));
  dispatch(showLoading());
  return CustomAxios(Strings.ERROR)
    .get(ENVIRONMENT.apiUrl + API.VARIANCES(mineGuid), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_VARIANCES));
      dispatch(varianceActions.storeVariances(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_MINE_VARIANCES)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchVarianceById = ({ mineGuid, varianceGuid }) => (dispatch) => {
  dispatch(request(reducerTypes.GET_VARIANCE));
  dispatch(showLoading("modal"));
  return CustomAxios(Strings.ERROR)
    .get(ENVIRONMENT.apiUrl + API.VARIANCE(mineGuid, varianceGuid), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_VARIANCE));
      dispatch(varianceActions.storeVariance(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_VARIANCE)))
    .finally(() => dispatch(hideLoading("modal")));
};

export const addDocumentToVariance = ({ mineGuid, varianceGuid }, payload) => (dispatch) => {
  dispatch(showLoading());
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
    .catch(() => dispatch(error(reducerTypes.ADD_DOCUMENT_TO_VARIANCE)))
    .finally(() => dispatch(hideLoading()));
};

export const removeDocumentFromVariance = ({ mineGuid, varianceGuid, mineDocumentGuid }) => (
  dispatch
) => {
  dispatch(showLoading());
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
    .catch(() => dispatch(error(reducerTypes.REMOVE_DOCUMENT_FROM_VARIANCE)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchMineComplianceCodes = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_COMPLIANCE_CODES));
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.COMPLIANCE_CODES, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_COMPLIANCE_CODES));
      dispatch(varianceActions.storeComplianceCodes(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_COMPLIANCE_CODES)));
};

export const fetchVarianceStatusOptions = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_VARIANCE_STATUS_OPTIONS));
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.VARIANCE_STATUS_CODES, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_VARIANCE_STATUS_OPTIONS));
      dispatch(varianceActions.storeVarianceStatusOptions(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_VARIANCE_STATUS_OPTIONS)));
};

export const fetchVarianceDocumentCategoryOptions = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_VARIANCE_DOCUMENT_CATEGORY_OPTIONS));
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl + API.VARIANCE_DOCUMENT_CATEGORY_OPTIONS}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_VARIANCE_DOCUMENT_CATEGORY_OPTIONS));
      dispatch(varianceActions.storeVarianceDocumentCategoryOptions(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_VARIANCE_DOCUMENT_CATEGORY_OPTIONS)));
};
