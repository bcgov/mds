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

export const fetchDraftPermitByNOW = (mineGuid, nowApplicationGuid) => (dispatch) => {
  dispatch(request(reducerTypes.GET_PERMITS));
  return CustomAxios({ errorToastMessage: String.ERROR })
    .get(
      ENVIRONMENT.apiUrl + API.DRAFT_PERMITS(mineGuid, nowApplicationGuid),
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.GET_PERMITS));
      dispatch(permitActions.storeDraftPermits(response.data));
    })
    .catch(() => {
      dispatch(error(reducerTypes.GET_PERMITS));
    });
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
      `${ENVIRONMENT.apiUrl}${API.PERMIT_AMENDMENTS(mineGuid, permitGuid)}`,
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
      `${ENVIRONMENT.apiUrl}${API.PERMIT_AMENDMENT(mineGuid, permitGuid, permitAmdendmentGuid)}`,
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
      `${ENVIRONMENT.apiUrl}${API.PERMIT_AMENDMENT_DOCUMENT(
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

export const deletePermit = (mineGuid, permitGuid) => (dispatch) => {
  dispatch(request(reducerTypes.DELETE_PERMIT));
  dispatch(showLoading());
  return CustomAxios()
    .delete(
      `${ENVIRONMENT.apiUrl}${API.PERMIT_DELETE(mineGuid, permitGuid)}`,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Successfully deleted permit and all related permit amendments and documents.",
        duration: 10,
      });
      dispatch(success(reducerTypes.DELETE_PERMIT));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.DELETE_PERMIT)))
    .finally(() => dispatch(hideLoading()));
};

export const deletePermitAmendment = (mineGuid, permitGuid, permitAmdendmentGuid) => (dispatch) => {
  dispatch(request(reducerTypes.DELETE_PERMIT_AMENDMENT));
  dispatch(showLoading());
  return CustomAxios()
    .delete(
      `${ENVIRONMENT.apiUrl}${API.PERMIT_AMENDMENT(mineGuid, permitGuid, permitAmdendmentGuid)}`,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Successfully deleted permit amendment and all related documents.",
        duration: 10,
      });
      dispatch(success(reducerTypes.DELETE_PERMIT_AMENDMENT));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.DELETE_PERMIT_AMENDMENT)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchPermitConditions = (permitAmdendmentGuid) => (dispatch) => {
  dispatch(request(reducerTypes.GET_PERMIT_CONDITIONS));
  dispatch(showLoading());
  return CustomAxios()
    .get(
      `${ENVIRONMENT.apiUrl}${API.PERMIT_CONDITIONS(null, null, permitAmdendmentGuid)}`,
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.GET_PERMIT_CONDITIONS));
      dispatch(permitActions.storePermitConditions(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_PERMIT_CONDITIONS)))
    .finally(() => dispatch(hideLoading()));
};

export const createPermitCondition = (permitAmdendmentGuid, payload) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_PERMIT_CONDITION));
  dispatch(showLoading());
  return CustomAxios()
    .post(
      `${ENVIRONMENT.apiUrl}${API.PERMIT_CONDITIONS(null, null, permitAmdendmentGuid)}`,
      { permit_condition: payload },
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Successfully created a new condition",
        duration: 10,
      });
      dispatch(success(reducerTypes.CREATE_PERMIT_CONDITION));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.CREATE_PERMIT_CONDITION)))
    .finally(() => dispatch(hideLoading("modal")));
};

export const deletePermitCondition = (permitAmdendmentGuid, permitConditionGuid) => (dispatch) => {
  dispatch(request(reducerTypes.DELETE_PERMIT_CONDITION));
  dispatch(showLoading());
  return CustomAxios()
    .delete(
      `${ENVIRONMENT.apiUrl}${API.PERMIT_CONDITION(
        null,
        null,
        permitAmdendmentGuid,
        permitConditionGuid
      )}`,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Successfully deleted permit condition.",
        duration: 10,
      });
      dispatch(success(reducerTypes.DELETE_PERMIT_CONDITION));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.DELETE_PERMIT_CONDITION)))
    .finally(() => dispatch(hideLoading()));
};

export const setEditingConditionFlag = (payload) => (dispatch) => {
  dispatch(permitActions.storeEditingConditionFlag(payload));
};
