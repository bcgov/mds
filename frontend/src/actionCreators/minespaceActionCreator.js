import axios from "axios";
import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { request, success, error } from "@/actions/genericActions";
import * as reducerTypes from "@/constants/reducerTypes";
import * as String from "@/constants/strings";
import * as API from "@/constants/API";
import { ENVIRONMENT } from "@/constants/environment";
import { createRequestHeader } from "@/utils/RequestHeaders";

export const createMinespaceUser = (payload) => (dispatch) => {
  console.log(payload);
  dispatch(request(reducerTypes.CREATE_MINESPACE_USER));
  dispatch(showLoading("modal"));
  return axios
    .post(ENVIRONMENT.apiUrl + API.MINESPACE_USER, payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: `Successfully created: ${payload.name}`,
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

export default createMinespaceUser;
