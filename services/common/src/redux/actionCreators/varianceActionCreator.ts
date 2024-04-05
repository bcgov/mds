import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { ENVIRONMENT } from "@mds/common/constants";
import { request, success, error, IDispatchError } from "../actions/genericActions";
import * as reducerTypes from "@mds/common/constants/reducerTypes";
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
  dispatch(request(reducerTypes.CREATE_MINE_VARIANCE));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .post(ENVIRONMENT.apiUrl + API.MINE_VARIANCES(mineGuid), payload, createRequestHeader())
    .then((response: AxiosResponse<IVariance>) => {
      notification.success({ message, duration: 10 });
      dispatch(success(reducerTypes.CREATE_MINE_VARIANCE));
      return response;
    })
    .catch(() => {
      dispatch(error(reducerTypes.CREATE_MINE_VARIANCE));
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const updateVariance = (
  { mineGuid, varianceGuid, codeLabel },
  payload: IVariance
): AppThunk<Promise<AxiosResponse<IVariance>>> => (dispatch): Promise<AxiosResponse<IVariance>> => {
  dispatch(request(reducerTypes.UPDATE_MINE_VARIANCE));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .put(ENVIRONMENT.apiUrl + API.VARIANCE(mineGuid, varianceGuid), payload, createRequestHeader())
    .then((response: AxiosResponse<IVariance>) => {
      notification.success({
        message: `Successfully updated the variance application for: ${codeLabel}`,
        duration: 10,
      });
      dispatch(success(reducerTypes.UPDATE_MINE_VARIANCE));
      return response;
    })
    .catch(() => {
      dispatch(error(reducerTypes.UPDATE_MINE_VARIANCE));
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const fetchVariancesByMine = ({ mineGuid }): AppThunk<Promise<void | IDispatchError>> => (
  dispatch
) => {
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

export const fetchVarianceById = (
  mineGuid: string,
  varianceGuid: string
): AppThunk<Promise<void | IDispatchError>> => (dispatch) => {
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

export const addDocumentToVariance = (
  { mineGuid, varianceGuid },
  payload: IAddDocumentToVariancePayload
): AppThunk<Promise<AxiosResponse<IVariance>>> => (dispatch): Promise<AxiosResponse<IVariance>> => {
  dispatch(showLoading("modal"));
  dispatch(request(reducerTypes.ADD_DOCUMENT_TO_VARIANCE));
  return CustomAxios()
    .put(
      ENVIRONMENT.apiUrl + API.VARIANCE_DOCUMENTS(mineGuid, varianceGuid),
      payload,
      createRequestHeader()
    )
    .then((response: AxiosResponse<IVariance>) => {
      dispatch(success(reducerTypes.ADD_DOCUMENT_TO_VARIANCE));
      return response;
    })
    .catch(() => {
      dispatch(error(reducerTypes.ADD_DOCUMENT_TO_VARIANCE));
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const removeDocumentFromVariance = (
  mineGuid: string,
  varianceGuid: string,
  mineDocumentGuid: string
): AppThunk<Promise<AxiosResponse<string>>> => (dispatch): Promise<AxiosResponse<string>> => {
  dispatch(showLoading("modal"));
  dispatch(request(reducerTypes.REMOVE_DOCUMENT_FROM_VARIANCE));
  return CustomAxios()
    .delete(
      ENVIRONMENT.apiUrl + API.VARIANCE_DOCUMENT(mineGuid, varianceGuid, mineDocumentGuid),
      createRequestHeader()
    )
    .then((response: AxiosResponse<string>) => {
      dispatch(success(reducerTypes.REMOVE_DOCUMENT_FROM_VARIANCE));
      return response;
    })
    .catch(() => {
      dispatch(error(reducerTypes.REMOVE_DOCUMENT_FROM_VARIANCE));
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const fetchVariances = (
  payload: Partial<IFetchVariancesPayload>
): AppThunk<Promise<void | IDispatchError>> => (dispatch) => {
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

export const deleteVariance = (
  mineGuid: string,
  varianceGuid: string
): AppThunk<Promise<AxiosResponse<string>>> => (dispatch): Promise<AxiosResponse<string>> => {
  dispatch(request(reducerTypes.DELETE_VARIANCE));
  dispatch(showLoading());
  return CustomAxios()
    .delete(`${ENVIRONMENT.apiUrl}${API.VARIANCE(mineGuid, varianceGuid)}`, createRequestHeader())
    .then((response: AxiosResponse<string>) => {
      notification.success({
        message: "Successfully deleted variance.",
        duration: 10,
      });
      dispatch(success(reducerTypes.DELETE_VARIANCE));
      return response;
    })
    .catch(() => {
      dispatch(error(reducerTypes.DELETE_VARIANCE));
    })
    .finally(() => dispatch(hideLoading()));
};
