import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { ENVIRONMENT, IMineAlert, IMineAlertCreate } from "@mds/common";
import { error, request, success } from "@mds/common/redux/actions/genericActions";
import { createRequestHeader } from "@common/utils/RequestHeaders";
import CustomAxios from "@common/customAxios";
import * as API from "@/constants/API";
import * as mineActions from "@/actions/mineAlertActions";
import * as reducerTypes from "@/constants/reducerTypes";
import { AxiosResponse } from "axios";
import { AppThunk } from "@/store/appThunk.type";

export const fetchGlobalMineAlerts = (): AppThunk<Promise<AxiosResponse<IMineAlert>>> => (
  dispatch
): Promise<AxiosResponse<IMineAlert>> => {
  dispatch(request(reducerTypes.GET_GLOBAL_MINE_ALERTS));
  dispatch(showLoading());
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl}${API.GLOBAL_MINE_ALERTS}`, createRequestHeader())
    .then((response: AxiosResponse<IMineAlert>) => {
      dispatch(success(reducerTypes.GET_GLOBAL_MINE_ALERTS));
      dispatch(mineActions.storeGlobalMineAlerts(response.data));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.GET_GLOBAL_MINE_ALERTS));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading()));
};

export const fetchMineAlertsByMine = (
  mineGuid: string
): AppThunk<Promise<AxiosResponse<IMineAlert>>> => (
  dispatch
): Promise<AxiosResponse<IMineAlert>> => {
  dispatch(request(reducerTypes.GET_MINE_ALERTS));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl}${API.MINE_ALERTS(mineGuid)}`, createRequestHeader())
    .then((response: AxiosResponse<IMineAlert>) => {
      dispatch(success(reducerTypes.GET_MINE_ALERTS));
      dispatch(mineActions.storeMineAlerts(response.data));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.GET_MINE_ALERTS));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading()));
};

export const createMineAlert = (
  mineGuid: string,
  payload: IMineAlertCreate
): AppThunk<Promise<AxiosResponse<IMineAlert>>> => (
  dispatch
): Promise<AxiosResponse<IMineAlert>> => {
  dispatch(request(reducerTypes.CREATE_MINE_ALERTS));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .post(`${ENVIRONMENT.apiUrl}${API.MINE_ALERTS(mineGuid)}`, payload, createRequestHeader())
    .then((response: AxiosResponse<IMineAlert>) => {
      notification.success({
        message: "Successfully created an alert.",
        duration: 10,
      });
      dispatch(success(reducerTypes.CREATE_MINE_ALERTS));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.CREATE_MINE_ALERTS));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const updateMineAlert = (
  mineGuid: string,
  mineAlertGuid: string,
  payload: IMineAlert
): AppThunk<Promise<AxiosResponse<IMineAlert>>> => (
  dispatch
): Promise<AxiosResponse<IMineAlert>> => {
  dispatch(request(reducerTypes.UPDATE_MINE_ALERT));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .put(
      `${ENVIRONMENT.apiUrl}${API.MINE_ALERT(mineGuid, mineAlertGuid)}`,
      payload,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Successfully updated alert.",
        duration: 10,
      });
      dispatch(success(reducerTypes.UPDATE_MINE_ALERT));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.UPDATE_MINE_ALERT));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const deleteMineAlert = (mineGuid: string, mineAlarmGuid: string) => (dispatch) => {
  dispatch(request(reducerTypes.DELETE_MINE_ALERT));
  dispatch(showLoading());
  return CustomAxios()
    .delete(
      `${ENVIRONMENT.apiUrl}${API.MINE_ALERT(mineGuid, mineAlarmGuid)}`,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Successfully deleted alert.",
        duration: 10,
      });
      dispatch(success(reducerTypes.DELETE_MINE_ALERT));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.DELETE_MINE_ALERT));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading()));
};
