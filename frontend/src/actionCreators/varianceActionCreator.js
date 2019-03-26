import axios from "axios";
import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { request, success, error } from "@/actions/genericActions";
import * as reducerTypes from "@/constants/reducerTypes";
import * as String from "@/constants/strings";
import * as varianceActions from "@/actions/varianceActions";
import * as API from "@/constants/API";
import { ENVIRONMENT } from "@/constants/environment";
import { createRequestHeader } from "@/utils/RequestHeaders";

export const createVariance = (payload, mineGuid) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_MINE_VARIANCE));
  dispatch(showLoading());
  return axios
    .post(ENVIRONMENT.apiUrl + API.VARIANCE(mineGuid), payload, createRequestHeader())
    .then((response) => {
      dispatch(hideLoading());
      notification.success({ message: "Successfully created a new variance", duration: 10 });
      dispatch(success(reducerTypes.CREATE_MINE_VARIANCE));
      return response;
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.CREATE_MINE_VARIANCE));
      dispatch(hideLoading());
      throw new Error(err);
    });
};

export const fetchVariancesByMine = (mineGuid) => (dispatch) => {
  dispatch(request(reducerTypes.GET_MINE_VARIANCES));
  dispatch(showLoading());
  return axios
    .get(ENVIRONMENT.apiUrl + API.VARIANCE(mineGuid), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_VARIANCES));
      dispatch(varianceActions.storeVariances(response.data));
      dispatch(hideLoading());
    })
    .catch(() => {
      notification.error({
        message: String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_MINE_VARIANCES));
      dispatch(hideLoading());
    });
};
