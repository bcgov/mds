import axios from "axios";
import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { DEFAULT_DASHBOARD_PARAMS, ENVIRONMENT } from "@mds/common";
import { request, success, error } from "@/actions/genericActions";
import * as userMineActions from "@/actions/userMineActions";
import * as reducerTypes from "@/constants/reducerTypes";
import * as API from "@mds/common/constants/API";
import { createRequestHeader } from "@/utils/RequestHeaders";

export const fetchUserMineInfo = (params = DEFAULT_DASHBOARD_PARAMS) => (dispatch) => {
  dispatch(showLoading());
  dispatch(request(reducerTypes.GET_USER_MINE_INFO));
  return axios
    .get(`${ENVIRONMENT.apiUrl + API.MINE_LIST_QUERY(params)}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_USER_MINE_INFO));
      dispatch(userMineActions.storeUserMineInfo(response.data));
      dispatch(hideLoading());
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_USER_MINE_INFO));
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
      dispatch(userMineActions.storeMine(response.data));
      dispatch(hideLoading());
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_MINE_RECORD));
      dispatch(hideLoading());
    });
};
