import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import {
  ENVIRONMENT,
  ICreatePermitPayload,
  IPermit,
  IPermitAmendment,
  ICreatePermitAmendmentPayload,
  ICreatePermitConditionPayload,
  IPermitCondition,
} from "@mds/common";
import { request, success, error } from "../actions/genericActions";
import * as reducerTypes from "../constants/reducerTypes";
import * as permitActions from "../actions/permitActions";
import * as String from "../constants/strings";
import * as API from "../constants/API";
import { createRequestHeader } from "../utils/RequestHeaders";
import CustomAxios from "../customAxios";
import { AxiosResponse } from "axios";
import { AppThunk } from "@/store/appThunk.type";

export const createPermit =
  (mineGuid: string, payload: ICreatePermitPayload): AppThunk<Promise<AxiosResponse<IPermit>>> =>
  (dispatch): Promise<AxiosResponse<IPermit>> => {
    dispatch(request(reducerTypes.CREATE_PERMIT));
    dispatch(showLoading("modal"));
    return CustomAxios()
      .post(ENVIRONMENT.apiUrl + API.PERMITS(mineGuid), payload, createRequestHeader())
      .then((response: AxiosResponse<IPermit>) => {
        notification.success({
          message: "Successfully created a new permit",
          duration: 10,
        });
        dispatch(success(reducerTypes.CREATE_PERMIT));
        return response;
      })
      .catch((err) => {
        dispatch(error(reducerTypes.CREATE_PERMIT));
        throw new Error(err);
      })
      .finally(() => dispatch(hideLoading("modal")));
  };

export const fetchPermits = (mineGuid: string) => (dispatch) => {
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

export const fetchDraftPermitByNOW =
  (mineGuid: string, nowApplicationGuid: string): AppThunk<Promise<AxiosResponse<IPermit[]>>> =>
  (dispatch): Promise<AxiosResponse<IPermit[]>> => {
    dispatch(request(reducerTypes.GET_PERMITS));
    dispatch(showLoading());
    return CustomAxios({ errorToastMessage: String.ERROR })
      .get(
        ENVIRONMENT.apiUrl + API.DRAFT_PERMITS(mineGuid, nowApplicationGuid),
        createRequestHeader()
      )
      .then((response: AxiosResponse<IPermit[]>) => {
        dispatch(success(reducerTypes.GET_PERMITS));
        dispatch(permitActions.storeDraftPermits(response.data));
        return response;
      })
      .catch((err) => {
        dispatch(error(reducerTypes.GET_PERMITS));
        throw new Error(err);
      })
      .finally(() => dispatch(hideLoading()));
  };

export const updatePermit =
  (
    mineGuid: string,
    permitGuid: string,
    payload: IPermit
  ): AppThunk<Promise<AxiosResponse<IPermit>>> =>
  (dispatch): Promise<AxiosResponse<IPermit>> => {
    dispatch(request(reducerTypes.UPDATE_PERMIT));
    dispatch(showLoading());
    return CustomAxios()
      .put(
        `${ENVIRONMENT.apiUrl}${API.PERMITS(mineGuid)}/${permitGuid}`,
        payload,
        createRequestHeader()
      )
      .then((response: AxiosResponse<IPermit>) => {
        notification.success({
          message: `Successfully updated permit`,
          duration: 10,
        });
        dispatch(success(reducerTypes.UPDATE_PERMIT));
        return response;
      })
      .catch((err) => {
        dispatch(error(reducerTypes.UPDATE_PERMIT));
        throw new Error(err);
      })
      .finally(() => dispatch(hideLoading()));
  };

export const createPermitAmendment =
  (
    mineGuid: string,
    permitGuid: string,
    payload: Partial<ICreatePermitAmendmentPayload>
  ): AppThunk<Promise<AxiosResponse<IPermitAmendment>>> =>
  (dispatch): Promise<AxiosResponse<IPermitAmendment>> => {
    dispatch(request(reducerTypes.CREATE_PERMIT_AMENDMENT));
    dispatch(showLoading("modal"));
    return CustomAxios()
      .post(
        `${ENVIRONMENT.apiUrl}${API.PERMIT_AMENDMENTS(mineGuid, permitGuid)}`,
        payload,
        createRequestHeader()
      )
      .then((response: AxiosResponse<IPermitAmendment>) => {
        notification.success({
          message: "Successfully created a new amendment",
          duration: 10,
        });
        dispatch(success(reducerTypes.CREATE_PERMIT_AMENDMENT));
        return response;
      })
      .catch((err) => {
        dispatch(error(reducerTypes.CREATE_PERMIT_AMENDMENT));
        throw new Error(err);
      })
      .finally(() => dispatch(hideLoading("modal")));
  };

export const createPermitAmendmentVC =
  (mineGuid: string, permitGuid: string, permitAmdendmentGuid: string) => (dispatch) => {
    dispatch(request(reducerTypes.PERMIT_AMENDMENT_VC));
    dispatch(showLoading());
    return CustomAxios()
      .post(
        `${ENVIRONMENT.apiUrl}${API.PERMIT_AMENDMENT_VC(
          mineGuid,
          permitGuid,
          permitAmdendmentGuid
        )}`,
        {},
        createRequestHeader()
      )
      .then((response) => {
        notification.success({
          message: `Successfully Issued Permit Verifiable Credentials, Thanks Jason`,
          duration: 10,
        });
        dispatch(success(reducerTypes.PERMIT_AMENDMENT_VC));
        return response;
      })
      .catch((err) => {
        dispatch(error(reducerTypes.PERMIT_AMENDMENT_VC));
        throw new Error(err);
      })
      .finally(() => dispatch(hideLoading()));
  };

export const updatePermitAmendment =
  (
    mineGuid: string,
    permitGuid: string,
    permitAmdendmentGuid: string,
    payload
  ): AppThunk<Promise<AxiosResponse<IPermitAmendment>>> =>
  (dispatch): Promise<AxiosResponse<IPermitAmendment>> => {
    dispatch(request(reducerTypes.UPDATE_PERMIT_AMENDMENT));
    dispatch(showLoading());
    return CustomAxios()
      .put(
        `${ENVIRONMENT.apiUrl}${API.PERMIT_AMENDMENT(mineGuid, permitGuid, permitAmdendmentGuid)}`,
        payload,
        createRequestHeader()
      )
      .then((response: AxiosResponse<IPermitAmendment>) => {
        const successMessage =
          response.data.permit_amendment_status_code === "DFT"
            ? "Successfully updated draft permit"
            : "Successfully updated permit amendment";
        notification.success({
          message: successMessage,
          duration: 10,
        });
        dispatch(success(reducerTypes.UPDATE_PERMIT_AMENDMENT));
        return response;
      })
      .catch((err) => {
        dispatch(error(reducerTypes.UPDATE_PERMIT_AMENDMENT));
        throw new Error(err);
      })
      .finally(() => dispatch(hideLoading()));
  };

export const getPermitAmendment =
  (
    mineGuid: string,
    permitAmdendmentGuid: string
  ): AppThunk<Promise<AxiosResponse<IPermitAmendment>>> =>
  (dispatch): Promise<AxiosResponse<IPermitAmendment>> => {
    dispatch(request(reducerTypes.GET_PERMIT_AMENDMENT));
    dispatch(showLoading());
    return CustomAxios()
      .get(
        `${ENVIRONMENT.apiUrl}${API.PERMIT_AMENDMENT(mineGuid, null, permitAmdendmentGuid)}`,
        createRequestHeader()
      )
      .then((response: AxiosResponse<IPermitAmendment>) => {
        dispatch(success(reducerTypes.GET_PERMIT_AMENDMENT));
        return response.data;
      })
      .catch((err) => {
        dispatch(error(reducerTypes.GET_PERMIT_AMENDMENT));
        throw new Error(err);
      })
      .finally(() => dispatch(hideLoading()));
  };

export const removePermitAmendmentDocument =
  (mineGuid: string, permitGuid: string, permitAmdendmentGuid: string, documentGuid: string) =>
  (dispatch) => {
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
      .catch((err) => {
        dispatch(error(reducerTypes.UPDATE_PERMIT_AMENDMENT_DOCUMENT));
        throw new Error(err);
      })
      .finally(() => dispatch(hideLoading()));
  };

export const deletePermit = (mineGuid: string, permitGuid: string) => (dispatch) => {
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
    .catch((err) => {
      dispatch(error(reducerTypes.DELETE_PERMIT));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading()));
};

export const deletePermitAmendment =
  (mineGuid: string, permitGuid: string, permitAmdendmentGuid: string) => (dispatch) => {
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
      .catch((err) => {
        dispatch(error(reducerTypes.DELETE_PERMIT_AMENDMENT));
        throw new Error(err);
      })
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
    .finally(() => dispatch(hideLoading()));
};

export const deletePermitCondition = (permitAmdendmentGuid, permitConditionGuid) => (dispatch) => {
  dispatch(request(reducerTypes.DELETE_PERMIT_CONDITION));
  dispatch(showLoading("modal"));
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
    .finally(() => dispatch(hideLoading("modal")));
};

export const setEditingConditionFlag = (payload) => (dispatch) => {
  dispatch(permitActions.storeEditingConditionFlag(payload));
};

export const updatePermitCondition =
  (permitConditionGuid, permitAmdendmentGuid, payload) => (dispatch) => {
    dispatch(request(reducerTypes.UPDATE_PERMIT_CONDITION));
    dispatch(showLoading());
    return CustomAxios()
      .put(
        `${ENVIRONMENT.apiUrl}${API.PERMIT_CONDITION(
          null,
          null,
          permitAmdendmentGuid,
          permitConditionGuid
        )}`,
        payload,
        createRequestHeader()
      )
      .then((response) => {
        notification.success({
          message: `Successfully updated permit condition`,
          duration: 10,
        });
        dispatch(success(reducerTypes.UPDATE_PERMIT_CONDITION));
        return response;
      })
      .catch(() => dispatch(error(reducerTypes.UPDATE_PERMIT_CONDITION)))
      .finally(() => dispatch(hideLoading()));
  };

export const patchPermitNumber = (permitGuid, mineGuid, payload) => (dispatch) => {
  dispatch(request(reducerTypes.PATCH_PERMIT));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .patch(
      `${ENVIRONMENT.apiUrl}${API.PERMITS(mineGuid)}/${permitGuid}`,
      payload,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Successfully updated permit",
        duration: 10,
      });
      dispatch(success(reducerTypes.PATCH_PERMIT));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.PATCH_PERMIT)))
    .finally(() => dispatch(hideLoading("modal")));
};

// standard permit conditions
export const fetchStandardPermitConditions = (noticeOfWorkType) => (dispatch) => {
  dispatch(request(reducerTypes.GET_PERMIT_CONDITIONS));
  dispatch(showLoading());
  return CustomAxios()
    .get(
      `${ENVIRONMENT.apiUrl}${API.STANDARD_PERMIT_CONDITIONS(noticeOfWorkType)}`,
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.GET_PERMIT_CONDITIONS));
      dispatch(permitActions.storeStandardPermitConditions(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_PERMIT_CONDITIONS)))
    .finally(() => dispatch(hideLoading()));
};

export const createStandardPermitCondition = (type, payload) => (dispatch) => {
  const newPayload = {
    ...payload,
    notice_of_work_type: type,
    parent_standard_permit_condition_id: payload.parent_permit_condition_id,
  };
  dispatch(request(reducerTypes.CREATE_PERMIT_CONDITION));
  dispatch(showLoading());
  return CustomAxios()
    .post(
      `${ENVIRONMENT.apiUrl}${API.STANDARD_PERMIT_CONDITIONS(type)}`,
      { standard_permit_condition: newPayload },
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
    .finally(() => dispatch(hideLoading()));
};

export const deleteStandardPermitCondition = (permitConditionGuid) => (dispatch) => {
  dispatch(request(reducerTypes.DELETE_PERMIT_CONDITION));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .delete(
      `${ENVIRONMENT.apiUrl}${API.STANDARD_PERMIT_CONDITION(permitConditionGuid)}`,
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
    .finally(() => dispatch(hideLoading("modal")));
};

export const updateStandardPermitCondition = (permitConditionGuid, payload) => (dispatch) => {
  dispatch(request(reducerTypes.UPDATE_PERMIT_CONDITION));
  dispatch(showLoading());
  return CustomAxios()
    .put(
      `${ENVIRONMENT.apiUrl}${API.STANDARD_PERMIT_CONDITION(permitConditionGuid)}`,
      payload,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: `Successfully updated permit condition`,
        duration: 10,
      });
      dispatch(success(reducerTypes.UPDATE_PERMIT_CONDITION));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.UPDATE_PERMIT_CONDITION)))
    .finally(() => dispatch(hideLoading()));
};
