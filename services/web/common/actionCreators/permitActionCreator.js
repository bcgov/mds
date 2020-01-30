import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { request, success, error } from "../actions/genericActions";
import * as reducerTypes from "../constants/reducerTypes";
import * as permitActions from "../actions/permitActions";
import * as String from "../constants/strings";
import * as API from "../constants/API";
import { ENVIRONMENT } from "../constants/environment";
import { createRequestHeader } from "../utils/RequestHeaders";
import CustomAxios from "../customAxios";

export const createPermit = (mineGuid, payload) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_PERMIT));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .post(ENVIRONMENT.apiUrl + API.PERMITS(mineGuid), payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: "Successfully created a new permit",
        duration: 10,
      });
      dispatch(success(reducerTypes.CREATE_PERMIT));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.CREATE_PERMIT)))
    .finally(() => dispatch(hideLoading("modal")));
};

export const fetchPermits = (mineGuid) => (dispatch) => {
  dispatch(request(reducerTypes.GET_PERMITS));
  dispatch(showLoading("modal"));
  return CustomAxios({ errorToastMessage: String.ERROR })
    .get(ENVIRONMENT.apiUrl + API.PERMITS(mineGuid), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_PERMITS));
      dispatch(permitActions.storePermits(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_PERMITS)))
    .finally(() => dispatch(hideLoading("modal")));
};

export const updatePermit = (mineGuid, permitGuid, payload) => (dispatch) => {
  dispatch(request(reducerTypes.UPDATE_PERMIT));
  dispatch(showLoading());
  return CustomAxios()
    .put(
      `${ENVIRONMENT.apiUrl}${API.PERMITS(mineGuid)}/${permitGuid}`,
      payload,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: `Successfully updated permit`,
        duration: 10,
      });
      dispatch(success(reducerTypes.UPDATE_PERMIT));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.UPDATE_PERMIT)))
    .finally(() => dispatch(hideLoading()));
};

export const createPermitAmendment = (mineGuid, permitGuid, payload) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_PERMIT_AMENDMENT));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .post(
      `${ENVIRONMENT.apiUrl}${API.PERMITAMENDMENTS(mineGuid, permitGuid)}`,
      payload,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Successfully created a new amendment",
        duration: 10,
      });
      dispatch(success(reducerTypes.CREATE_PERMIT_AMENDMENT));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.CREATE_PERMIT_AMENDMENT)))
    .finally(() => dispatch(hideLoading("modal")));
};

export const updatePermitAmendment = (mineGuid, permitGuid, permitAmdendmentGuid, payload) => (
  dispatch
) => {
  dispatch(request(reducerTypes.UPDATE_PERMIT_AMENDMENT));
  dispatch(showLoading());
  return CustomAxios()
    .put(
      `${ENVIRONMENT.apiUrl}${API.PERMITAMENDMENT(mineGuid, permitGuid, permitAmdendmentGuid)}`,
      payload,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: `Successfully updated permit amendment`,
        duration: 10,
      });
      dispatch(success(reducerTypes.UPDATE_PERMIT_AMENDMENT));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.UPDATE_PERMIT_AMENDMENT)))
    .finally(() => dispatch(hideLoading()));
};

export const removePermitAmendmentDocument = (
  mineGuid,
  permitGuid,
  permitAmdendmentGuid,
  documentGuid
) => (dispatch) => {
  dispatch(request(reducerTypes.UPDATE_PERMIT_AMENDMENT_DOCUMENT));
  dispatch(showLoading());
  return CustomAxios()
    .delete(
      `${ENVIRONMENT.apiUrl}${API.PERMITAMENDMENTDOCUMENT(
        mineGuid,
        permitGuid,
        permitAmdendmentGuid,
        documentGuid
      )}`,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: `Successfully removed attached document`,
        duration: 10,
      });
      dispatch(success(reducerTypes.UPDATE_PERMIT_AMENDMENT_DOCUMENT));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.UPDATE_PERMIT_AMENDMENT_DOCUMENT)))
    .finally(() => dispatch(hideLoading()));
};
