import { showLoading, hideLoading } from "react-redux-loading-bar";
import { notification } from "antd";
import { ENVIRONMENT } from "@mds/common/constants";
import { request, success, error } from "../actions/genericActions";
import { NetworkReducerTypes } from "@mds/common/constants/networkReducerTypes";
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
    dispatch(request(NetworkReducerTypes.CREATE_MINE_WORK_INFORMATION));
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
        dispatch(success(NetworkReducerTypes.CREATE_MINE_WORK_INFORMATION));
        return response;
      })
      .catch(() => {
        dispatch(error(NetworkReducerTypes.CREATE_MINE_WORK_INFORMATION));
      })
      .finally(() => dispatch(hideLoading("modal")));
  };

export const fetchMineWorkInformations = (
  mineGuid: string
): AppThunk<Promise<AxiosResponse<IMineWorkInformation>>> => (
  dispatch
): Promise<AxiosResponse<IMineWorkInformation>> => {
    dispatch(request(NetworkReducerTypes.GET_MINE_WORK_INFORMATIONS));
    dispatch(showLoading());
    return CustomAxios()
      .get(`${ENVIRONMENT.apiUrl}${API.MINE_WORK_INFORMATIONS(mineGuid)}`, createRequestHeader())
      .then((response: AxiosResponse<IMineWorkInformation>) => {
        dispatch(success(NetworkReducerTypes.GET_MINE_WORK_INFORMATIONS));
        dispatch(workInformationActions.storeMineWorkInformations(response.data));
        return response;
      })
      .catch(() => {
        dispatch(error(NetworkReducerTypes.GET_MINE_WORK_INFORMATIONS));
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
    dispatch(request(NetworkReducerTypes.UPDATE_MINE_WORK_INFORMATION));
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
        dispatch(success(NetworkReducerTypes.UPDATE_MINE_WORK_INFORMATION));
        return response;
      })
      .catch(() => {
        dispatch(error(NetworkReducerTypes.UPDATE_MINE_WORK_INFORMATION));
      })
      .finally(() => dispatch(hideLoading("modal")));
  };

export const deleteMineWorkInformation = (
  mineGuid: string,
  mineWorkInformationGuid: string
): AppThunk<Promise<AxiosResponse<string>>> => (dispatch): Promise<AxiosResponse<string>> => {
  dispatch(request(NetworkReducerTypes.DELETE_MINE_WORK_INFORMATION));
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
      dispatch(success(NetworkReducerTypes.DELETE_MINE_WORK_INFORMATION));
      return response;
    })
    .catch(() => {
      dispatch(error(NetworkReducerTypes.DELETE_MINE_WORK_INFORMATION));
    })
    .finally(() => dispatch(hideLoading()));
};
