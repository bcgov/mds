import { showLoading, hideLoading } from "react-redux-loading-bar";
import { notification } from "antd";
import { ENVIRONMENT } from "@mds/common/constants";
import { request, success, error } from "../actions/genericActions";
import * as reducerTypes from "@mds/common/constants/reducerTypes";
import * as workInformationActions from "../actions/workInformationActions";
import * as API from "@mds/common/constants/API";
import { createRequestHeader } from "../utils/RequestHeaders";
import CustomAxios from "../customAxios";
import { AxiosResponse } from "axios";
import { AppThunk } from "@mds/common/interfaces/appThunk.type";
import { IMineWorkInformation } from "@mds/common/interfaces";

export const createMineWorkInformation = (
  mineGuid: string,
  payload: Partial<IMineWorkInformation>
): AppThunk<Promise<AxiosResponse<IMineWorkInformation>>> => (
  dispatch
): Promise<AxiosResponse<IMineWorkInformation>> => {
  dispatch(request(reducerTypes.CREATE_MINE_WORK_INFORMATION));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .post(
      `${ENVIRONMENT.apiUrl}${API.MINE_WORK_INFORMATIONS(mineGuid)}`,
      payload,
      createRequestHeader()
    )
    .then((response: AxiosResponse<IMineWorkInformation>) => {
      notification.success({
        message: "Successfully created work information.",
        duration: 10,
      });
      dispatch(success(reducerTypes.CREATE_MINE_WORK_INFORMATION));
      return response;
    })
    .catch(() => {
      dispatch(error(reducerTypes.CREATE_MINE_WORK_INFORMATION));
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const fetchMineWorkInformations = (
  mineGuid: string
): AppThunk<Promise<AxiosResponse<IMineWorkInformation>>> => (
  dispatch
): Promise<AxiosResponse<IMineWorkInformation>> => {
  dispatch(request(reducerTypes.GET_MINE_WORK_INFORMATIONS));
  dispatch(showLoading());
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl}${API.MINE_WORK_INFORMATIONS(mineGuid)}`, createRequestHeader())
    .then((response: AxiosResponse<IMineWorkInformation>) => {
      dispatch(success(reducerTypes.GET_MINE_WORK_INFORMATIONS));
      dispatch(workInformationActions.storeMineWorkInformations(response.data));
      return response;
    })
    .catch(() => {
      dispatch(error(reducerTypes.GET_MINE_WORK_INFORMATIONS));
    })
    .finally(() => dispatch(hideLoading()));
};

export const updateMineWorkInformation = (
  mineGuid: string,
  mineWorkInformationGuid: string,
  payload: Partial<IMineWorkInformation>
): AppThunk<Promise<AxiosResponse<IMineWorkInformation>>> => (
  dispatch
): Promise<AxiosResponse<IMineWorkInformation>> => {
  dispatch(request(reducerTypes.UPDATE_MINE_WORK_INFORMATION));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .put(
      `${ENVIRONMENT.apiUrl}${API.MINE_WORK_INFORMATION(mineGuid, mineWorkInformationGuid)}`,
      payload,
      createRequestHeader()
    )
    .then((response: AxiosResponse<IMineWorkInformation>) => {
      notification.success({
        message: "Successfully updated work information.",
        duration: 10,
      });
      dispatch(success(reducerTypes.UPDATE_MINE_WORK_INFORMATION));
      return response;
    })
    .catch(() => {
      dispatch(error(reducerTypes.UPDATE_MINE_WORK_INFORMATION));
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const deleteMineWorkInformation = (
  mineGuid: string,
  mineWorkInformationGuid: string
): AppThunk<Promise<AxiosResponse<string>>> => (dispatch): Promise<AxiosResponse<string>> => {
  dispatch(request(reducerTypes.DELETE_MINE_WORK_INFORMATION));
  dispatch(showLoading());
  return CustomAxios()
    .delete(
      `${ENVIRONMENT.apiUrl}${API.MINE_WORK_INFORMATION(mineGuid, mineWorkInformationGuid)}`,
      createRequestHeader()
    )
    .then((response: AxiosResponse<string>) => {
      notification.success({
        message: "Successfully deleted work information.",
        duration: 10,
      });
      dispatch(success(reducerTypes.DELETE_MINE_WORK_INFORMATION));
      return response;
    })
    .catch(() => {
      dispatch(error(reducerTypes.DELETE_MINE_WORK_INFORMATION));
    })
    .finally(() => dispatch(hideLoading()));
};
