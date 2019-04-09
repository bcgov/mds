import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { request, success, error } from "@/actions/genericActions";
import * as reducerTypes from "@/constants/reducerTypes";
import * as permitActions from "@/actions/permitActions";
import * as String from "@/constants/strings";
import * as API from "@/constants/API";
import { ENVIRONMENT } from "@/constants/environment";
import { createRequestHeader } from "@/utils/RequestHeaders";
import CustomAxios from "@/customAxios";

export const createPermit = (payload) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_PERMIT));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .post(ENVIRONMENT.apiUrl + API.PERMIT(), payload, createRequestHeader())
    .then((response) => {
      notification.success({ message: "Successfully created a new permit", duration: 10 });
      dispatch(success(reducerTypes.CREATE_PERMIT));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.CREATE_PERMIT)))
    .finally(() => dispatch(hideLoading("modal")));
};

export const fetchPermits = (params = {}) => (dispatch) => {
  dispatch(request(reducerTypes.GET_PERMITS));
  dispatch(showLoading("modal"));
  return CustomAxios(String.ERROR)
    .get(ENVIRONMENT.apiUrl + API.PERMIT(params), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_PERMITS));
      dispatch(permitActions.storePermits(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_PERMITS)))
    .finally(() => dispatch(hideLoading("modal")));
};

export const updatePermit = (permit_guid, payload) => (dispatch) => {
  dispatch(request(reducerTypes.UPDATE_PERMIT));
  dispatch(showLoading());
  return CustomAxios()
    .put(`${ENVIRONMENT.apiUrl}${API.PERMIT()}/${permit_guid}`, payload, createRequestHeader())
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

export const createPermitAmendment = (permitGuid, payload) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_PERMIT_AMENDMENT));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .post(
      `${ENVIRONMENT.apiUrl}${API.PERMITAMENDMENTS(permitGuid)}`,
      payload,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({ message: "Successfully created a new amendment", duration: 10 });
      dispatch(success(reducerTypes.CREATE_PERMIT_AMENDMENT));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.CREATE_PERMIT_AMENDMENT)))
    .finally(() => dispatch(hideLoading("modal")));
};

export const updatePermitAmendment = (permitAmdendmentGuid, payload) => (dispatch) => {
  dispatch(request(reducerTypes.UPDATE_PERMIT_AMENDMENT));
  dispatch(showLoading());
  return CustomAxios()
    .put(
      `${ENVIRONMENT.apiUrl}${API.PERMITAMENDMENT(permitAmdendmentGuid)}`,
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

export const removePermitAmendmentDocument = (permitAmdendmentGuid, documentGuid) => (dispatch) => {
  dispatch(request(reducerTypes.UPDATE_PERMIT_AMENDMENT_DOCUMENT));
  dispatch(showLoading());
  return CustomAxios()
    .delete(
      `${ENVIRONMENT.apiUrl}${API.PERMITAMENDMENTDOCUMENT(permitAmdendmentGuid, documentGuid)}`,
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
