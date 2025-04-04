import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import { request, success, error, IDispatchError } from "../actions/genericActions";
import { NetworkReducerTypes } from "@mds/common/constants/networkReducerTypes";
import * as Strings from "@mds/common/constants/strings";
import * as varianceActions from "../actions/varianceActions";
import * as API from "@mds/common/constants/API";
import { createRequestHeader } from "../utils/RequestHeaders";
import CustomAxios from "../customAxios";
import { AxiosResponse } from "axios";
import { AppThunk } from "@mds/common/interfaces/appThunk.type";
import {
  ICreateVariancePayload,
  IVariance,
  IAddDocumentToVariancePayload,
  IFetchVariancesPayload,
} from "@mds/common/interfaces";

export const createVariance = (
  { mineGuid },
  payload: ICreateVariancePayload
): AppThunk<Promise<AxiosResponse<IVariance>>> => (dispatch): Promise<AxiosResponse<IVariance>> => {
  const message =
    payload.variance_application_status_code === Strings.VARIANCE_APPLICATION_CODE
      ? "Successfully applied for a new variance"
      : "Successfully added an approved variance";
  dispatch(request(NetworkReducerTypes.CREATE_MINE_VARIANCE));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .post(ENVIRONMENT.apiUrl + API.MINE_VARIANCES(mineGuid), payload, createRequestHeader())
    .then((response: AxiosResponse<IVariance>) => {
      notification.success({ message, duration: 10 });
      dispatch(success(NetworkReducerTypes.CREATE_MINE_VARIANCE));
      return response;
    })
    .catch(() => {
      dispatch(error(NetworkReducerTypes.CREATE_MINE_VARIANCE));
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const updateVariance = (
  { mineGuid, varianceGuid, codeLabel },
  payload: IVariance
): AppThunk<Promise<AxiosResponse<IVariance>>> => (dispatch): Promise<AxiosResponse<IVariance>> => {
  dispatch(request(NetworkReducerTypes.UPDATE_MINE_VARIANCE));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .put(ENVIRONMENT.apiUrl + API.VARIANCE(mineGuid, varianceGuid), payload, createRequestHeader())
    .then((response: AxiosResponse<IVariance>) => {
      notification.success({
        message: `Successfully updated the variance application for: ${codeLabel}`,
        duration: 10,
      });
      dispatch(success(NetworkReducerTypes.UPDATE_MINE_VARIANCE));
      return response;
    })
    .catch(() => {
      dispatch(error(NetworkReducerTypes.UPDATE_MINE_VARIANCE));
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const fetchVariancesByMine = ({ mineGuid }): AppThunk<Promise<void | IDispatchError>> => (
  dispatch
) => {
  dispatch(request(NetworkReducerTypes.GET_VARIANCES));
  dispatch(showLoading());
  return CustomAxios({ errorToastMessage: Strings.ERROR })
    .get(ENVIRONMENT.apiUrl + API.MINE_VARIANCES(mineGuid), createRequestHeader())
    .then((response) => {
      dispatch(success(NetworkReducerTypes.GET_VARIANCES));
      dispatch(varianceActions.storeVariances(response.data));
    })
    .catch(() => dispatch(error(NetworkReducerTypes.GET_VARIANCES)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchVarianceById = (
  mineGuid: string,
  varianceGuid: string
): AppThunk<Promise<void | IDispatchError>> => (dispatch) => {
  dispatch(request(NetworkReducerTypes.GET_VARIANCE));
  dispatch(showLoading("modal"));
  return CustomAxios({ errorToastMessage: Strings.ERROR })
    .get(ENVIRONMENT.apiUrl + API.VARIANCE(mineGuid, varianceGuid), createRequestHeader())
    .then((response) => {
      dispatch(success(NetworkReducerTypes.GET_VARIANCE));
      dispatch(varianceActions.storeVariance(response.data));
    })
    .catch(() => dispatch(error(NetworkReducerTypes.GET_VARIANCE)))
    .finally(() => dispatch(hideLoading("modal")));
};

export const addDocumentToVariance = (
  { mineGuid, varianceGuid },
  payload: IAddDocumentToVariancePayload
): AppThunk<Promise<AxiosResponse<IVariance>>> => (dispatch): Promise<AxiosResponse<IVariance>> => {
  dispatch(showLoading("modal"));
  dispatch(request(NetworkReducerTypes.ADD_DOCUMENT_TO_VARIANCE));
  return CustomAxios()
    .put(
      ENVIRONMENT.apiUrl + API.VARIANCE_DOCUMENTS(mineGuid, varianceGuid),
      payload,
      createRequestHeader()
    )
    .then((response: AxiosResponse<IVariance>) => {
      dispatch(success(NetworkReducerTypes.ADD_DOCUMENT_TO_VARIANCE));
      return response;
    })
    .catch(() => {
      dispatch(error(NetworkReducerTypes.ADD_DOCUMENT_TO_VARIANCE));
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const removeDocumentFromVariance = (
  mineGuid: string,
  varianceGuid: string,
  mineDocumentGuid: string
): AppThunk<Promise<AxiosResponse<string>>> => (dispatch): Promise<AxiosResponse<string>> => {
  dispatch(showLoading("modal"));
  dispatch(request(NetworkReducerTypes.REMOVE_DOCUMENT_FROM_VARIANCE));
  return CustomAxios()
    .delete(
      ENVIRONMENT.apiUrl + API.VARIANCE_DOCUMENT(mineGuid, varianceGuid, mineDocumentGuid),
      createRequestHeader()
    )
    .then((response: AxiosResponse<string>) => {
      dispatch(success(NetworkReducerTypes.REMOVE_DOCUMENT_FROM_VARIANCE));
      return response;
    })
    .catch(() => {
      dispatch(error(NetworkReducerTypes.REMOVE_DOCUMENT_FROM_VARIANCE));
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const fetchVariances = (
  payload: Partial<IFetchVariancesPayload>
): AppThunk<Promise<void | IDispatchError>> => (dispatch) => {
  dispatch(request(NetworkReducerTypes.GET_VARIANCES));
  dispatch(showLoading());
  return CustomAxios({ errorToastMessage: Strings.ERROR })
    .get(ENVIRONMENT.apiUrl + API.VARIANCES(payload), createRequestHeader())
    .then((response) => {
      dispatch(success(NetworkReducerTypes.GET_VARIANCES));
      dispatch(varianceActions.storeVariances(response.data));
    })
    .catch(() => dispatch(error(NetworkReducerTypes.GET_VARIANCES)))
    .finally(() => dispatch(hideLoading()));
};

export const deleteVariance = (
  mineGuid: string,
  varianceGuid: string
): AppThunk<Promise<AxiosResponse<string>>> => (dispatch): Promise<AxiosResponse<string>> => {
  dispatch(request(NetworkReducerTypes.DELETE_VARIANCE));
  dispatch(showLoading());
  return CustomAxios()
    .delete(`${ENVIRONMENT.apiUrl}${API.VARIANCE(mineGuid, varianceGuid)}`, createRequestHeader())
    .then((response: AxiosResponse<string>) => {
      notification.success({
        message: "Successfully deleted variance.",
        duration: 10,
      });
      dispatch(success(NetworkReducerTypes.DELETE_VARIANCE));
      return response;
    })
    .catch(() => {
      dispatch(error(NetworkReducerTypes.DELETE_VARIANCE));
    })
    .finally(() => dispatch(hideLoading()));
};
