import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { request, success, error } from "../actions/genericActions";
import * as reducerTypes from "../constants/reducerTypes";
import * as minespaceActions from "../actions/minespaceActions";
import * as String from "../constants/strings";
import * as API from "../constants/API";
import { ENVIRONMENT } from "../constants/environment";
import { createRequestHeader } from "../utils/RequestHeaders";
import CustomAxios from "../customAxios";

export const createMinespaceUser = (payload) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_MINESPACE_USER));
  dispatch(showLoading());
  return CustomAxios()
    .post(ENVIRONMENT.apiUrl + API.MINESPACE_USER, payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: `Successfully created MineSpace user.`,
        duration: 10,
      });
      dispatch(success(reducerTypes.CREATE_MINESPACE_USER));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.CREATE_MINESPACE_USER)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchMinespaceUsers = () => (dispatch) => {
  dispatch(showLoading());
  dispatch(request(reducerTypes.GET_MINESPACE_USER));
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.MINESPACE_USER, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINESPACE_USER));
      dispatch(minespaceActions.storeMinespaceUserList(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_MINESPACE_USER)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchMinespaceUserMines = (mine_guids) => (dispatch) => {
  dispatch(showLoading());
  dispatch(request(reducerTypes.GET_MINESPACE_USER_MINES));
  return CustomAxios()
    .post(ENVIRONMENT.apiUrl + API.MINE_BASIC_INFO_LIST, { mine_guids }, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINESPACE_USER_MINES));
      dispatch(minespaceActions.storeMinespaceUserMineList(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_MINESPACE_USER_MINES)))
    .finally(() => dispatch(hideLoading()));
};

export const deleteMinespaceUser = (minespaceUserId) => (dispatch) => {
  dispatch(showLoading());
  dispatch(request(reducerTypes.DELETE_MINESPACE_USER));
  return CustomAxios({ errorToastMessage: String.ERROR })
    .delete(`${ENVIRONMENT.apiUrl}${API.MINESPACE_USER}/${minespaceUserId}`, createRequestHeader())
    .then(() => {
      dispatch(success(reducerTypes.DELETE_MINESPACE_USER));
    })
    .catch(() => dispatch(error(reducerTypes.DELETE_MINESPACE_USER)))
    .finally(() => dispatch(hideLoading()));
};
