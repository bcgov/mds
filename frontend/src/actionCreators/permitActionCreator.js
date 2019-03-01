import axios from "axios";
import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { request, success, error } from "@/actions/genericActions";
import * as reducerTypes from "@/constants/reducerTypes";
import * as permitActions from "@/actions/permitActions";
import * as String from "@/constants/strings";
import * as API from "@/constants/API";
import { ENVIRONMENT } from "@/constants/environment";
import { createRequestHeader } from "@/utils/RequestHeaders";
import queryString from "query-string";

export const fetchPermits = (params = {}) => (dispatch) => {
  dispatch(request(reducerTypes.GET_PERMITS));
  dispatch(showLoading("modal"));
  return axios
    .get(ENVIRONMENT.apiUrl + API.PERMIT(params), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_PERMITS));
      dispatch(permitActions.storePermits(response.data));
      dispatch(hideLoading("modal"));
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_PERMITS));
      dispatch(hideLoading("modal"));
    });
};
