import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { request, success, error } from "../actions/genericActions";
import * as reducerTypes from "../constants/reducerTypes";
import * as explosivesPermitActions from "../actions/explosivesPermitActions";
import * as String from "../constants/strings";
import * as API from "../constants/API";
import { ENVIRONMENT } from "../constants/environment";
import { createRequestHeader } from "../utils/RequestHeaders";
import CustomAxios from "../customAxios";

export const createExplosivesPermit = (mineGuid, payload) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_EXPLOSIVES_PERMIT));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .post(ENVIRONMENT.apiUrl + API.EXPLOSIVES_PERMITS(mineGuid), payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: "Successfully created Explosives Permit",
        duration: 10,
      });
      dispatch(success(reducerTypes.CREATE_EXPLOSIVES_PERMIT));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.CREATE_EXPLOSIVES_PERMIT));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const fetchExplosivesPermits = (mineGuid) => (dispatch) => {
  dispatch(request(reducerTypes.GET_EXPLOSIVES_PERMITS));
  dispatch(showLoading());
  return CustomAxios({ errorToastMessage: String.ERROR })
    .get(ENVIRONMENT.apiUrl + API.EXPLOSIVES_PERMITS(mineGuid), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_EXPLOSIVES_PERMITS));
      dispatch(explosivesPermitActions.storeExplosivesPermits(response.data));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.GET_EXPLOSIVES_PERMITS));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading()));
};

export const updateExplosivesPermit = (mineGuid, explosivesPermitGuid, payload) => (dispatch) => {
  dispatch(request(reducerTypes.UPDATE_EXPLOSIVES_PERMIT));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .put(
      ENVIRONMENT.apiUrl + API.EXPLOSIVES_PERMIT(mineGuid, explosivesPermitGuid),
      payload,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Successfully updated Explosives Permit",
        duration: 10,
      });
      dispatch(success(reducerTypes.UPDATE_EXPLOSIVES_PERMIT));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.UPDATE_EXPLOSIVES_PERMIT));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const deleteExplosivesPermit = (mineGuid, explosivesPermitGuid) => (dispatch) => {
  dispatch(request(reducerTypes.DELETE_EXPLOSIVES_PERMIT));
  dispatch(showLoading());
  return CustomAxios()
    .delete(
      `${ENVIRONMENT.apiUrl}${API.EXPLOSIVES_PERMIT(mineGuid, explosivesPermitGuid)}`,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Successfully deleted Explosives Permit",
        duration: 10,
      });
      dispatch(success(reducerTypes.DELETE_EXPLOSIVES_PERMIT));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.DELETE_EXPLOSIVES_PERMIT));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading()));
};
