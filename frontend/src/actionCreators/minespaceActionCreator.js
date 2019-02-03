import axios from "axios";
import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { request, success, error } from "@/actions/genericActions";
import * as reducerTypes from "@/constants/reducerTypes";
import * as minespaceActions from "@/actions/minespaceActions";
import * as String from "@/constants/strings";
import * as API from "@/constants/API";
import { ENVIRONMENT } from "@/constants/environment";
import { createRequestHeader } from "@/utils/RequestHeaders";

export const createMinespaceUser = (payload) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_MINESPACE_USER));
  dispatch(showLoading("modal"));
  return axios
    .post(ENVIRONMENT.apiUrl + API.MINESPACE_USER, payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: `Successfully created minespace user.`,
        duration: 10,
      });
      dispatch(success(reducerTypes.CREATE_MINESPACE_USER));
      dispatch(hideLoading("modal"));
      return response;
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.CREATE_MINESPACE_USER));
      dispatch(hideLoading("modal"));
    });
};

export const fetchMinespaceUsers = () => (dispatch) => {
  dispatch(showLoading());
  dispatch(request(reducerTypes.GET_MINESPACE_USER));
  return axios
    .get(ENVIRONMENT.apiUrl + API.MINESPACE_USER, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINESPACE_USER));
      dispatch(minespaceActions.storeMinespaceUserList(response.data));
      dispatch(hideLoading());
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_MINESPACE_USER));
      dispatch(hideLoading());
    });
};

export const deleteMinespaceUser = (minespaceUserId) => (dispatch) => {
  dispatch(showLoading());
  dispatch(request(reducerTypes.DELETE_MINESPACE_USER));
  return axios
    .delete(`${ENVIRONMENT.apiUrl}${API.MINESPACE_USER}/${minespaceUserId}`, createRequestHeader())
    .then(() => {
      dispatch(success(reducerTypes.DELETE_MINESPACE_USER));
      dispatch(hideLoading());
    })
    .catch(() => {
      notification.error({
        message: String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.DELETE_MINESPACE_USER));
      dispatch(hideLoading());
    });
};
