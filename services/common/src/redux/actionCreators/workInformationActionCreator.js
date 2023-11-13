import { showLoading, hideLoading } from "react-redux-loading-bar";
import { notification } from "antd";
import { ENVIRONMENT } from "@mds/common";
import { request, success, error } from "../actions/genericActions";
import * as reducerTypes from "@mds/common/constants/reducerTypes";
import * as workInformationActions from "../actions/workInformationActions";
import * as API from "@mds/common/constants/API";
import { createRequestHeader } from "../utils/RequestHeaders";
import CustomAxios from "../customAxios";

export const createMineWorkInformation = (mineGuid, payload) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_MINE_WORK_INFORMATION));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .post(
      `${ENVIRONMENT.apiUrl}${API.MINE_WORK_INFORMATIONS(mineGuid)}`,
      payload,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Successfully created work information.",
        duration: 10,
      });
      dispatch(success(reducerTypes.CREATE_MINE_WORK_INFORMATION));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.CREATE_MINE_WORK_INFORMATION));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const fetchMineWorkInformations = (mineGuid) => (dispatch) => {
  dispatch(request(reducerTypes.GET_MINE_WORK_INFORMATIONS));
  dispatch(showLoading());
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl}${API.MINE_WORK_INFORMATIONS(mineGuid)}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_WORK_INFORMATIONS));
      dispatch(workInformationActions.storeMineWorkInformations(response.data));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.GET_MINE_WORK_INFORMATIONS));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading()));
};

export const updateMineWorkInformation = (mineGuid, mineWorkInformationGuid, payload) => (
  dispatch
) => {
  dispatch(request(reducerTypes.UPDATE_MINE_WORK_INFORMATION));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .put(
      `${ENVIRONMENT.apiUrl}${API.MINE_WORK_INFORMATION(mineGuid, mineWorkInformationGuid)}`,
      payload,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Successfully updated work information.",
        duration: 10,
      });
      dispatch(success(reducerTypes.UPDATE_MINE_WORK_INFORMATION));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.UPDATE_MINE_WORK_INFORMATION));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const deleteMineWorkInformation = (mineGuid, mineWorkInformationGuid) => (dispatch) => {
  dispatch(request(reducerTypes.DELETE_MINE_WORK_INFORMATION));
  dispatch(showLoading());
  return CustomAxios()
    .delete(
      `${ENVIRONMENT.apiUrl}${API.MINE_WORK_INFORMATION(mineGuid, mineWorkInformationGuid)}`,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Successfully deleted work information.",
        duration: 10,
      });
      dispatch(success(reducerTypes.DELETE_MINE_WORK_INFORMATION));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.DELETE_MINE_WORK_INFORMATION));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading()));
};
