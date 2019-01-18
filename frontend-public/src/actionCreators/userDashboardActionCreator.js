import axios from "axios";
import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { request, success, error, clear } from "@/actions/genericActions";
import * as userMineInfoActions from "@/actions/userMineInfoActions";
import * as reducerTypes from "@/constants/reducerTypes";
import * as API from "@/constants/API";
import { ENVIRONMENT } from "@/constants/environment";
import { createRequestHeader } from "@/utils/RequestHeaders";

// This file is anticipated to have multiple exports
// eslint-disable-next-line import/prefer-default-export
export const fetchUserMineInfo = () => (dispatch) => {
  dispatch(showLoading());
  dispatch(request(reducerTypes.GET_MINE_INFO));
  return axios
    .get(`${ENVIRONMENT.apiUrl + API.MINE_NAME_LIST}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_INFO));
      dispatch(userMineInfoActions.storeUserMineInfo(response.data));
      dispatch(hideLoading());
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_MINE_INFO));
      dispatch(clear(reducerTypes.GET_MINE_INFO));
      dispatch(hideLoading());
    });
};

export const fetchMineRecordById = (mineId) => (dispatch) => {
  dispatch(showLoading());
  dispatch(request(reducerTypes.GET_MINE_RECORD));
  return axios
    .get(`${ENVIRONMENT.apiUrl + API.MINE}/${mineId}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_RECORD));
      dispatch(userMineInfoActions.storeMine(response.data));
      dispatch(hideLoading());
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_MINE_RECORD));
      dispatch(hideLoading());
    });
};
