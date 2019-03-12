import axios from "axios";
import queryString from "query-string";
import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { request, success, error } from "@/actions/genericActions";
import * as reducerTypes from "@/constants/reducerTypes";
import * as applicationActions from "@/actions/applicationActions";
import * as String from "@/constants/strings";
import * as API from "@/constants/API";
import { ENVIRONMENT } from "@/constants/environment";
import { createRequestHeader } from "@/utils/RequestHeaders";

// This file is anticipated to have multiple exports
// eslint-disable-next-line import/prefer-default-export
export const fetchApplications = (params) => (dispatch) => {
  dispatch(request(reducerTypes.GET_APPLICATIONS));
  dispatch(showLoading("modal"));
  return axios
    .get(
      `${ENVIRONMENT.apiUrl + API.APPLICATIONS}?${queryString.stringify(params)}`,
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.GET_APPLICATIONS));
      dispatch(applicationActions.storeApplications(response.data));
      dispatch(hideLoading("modal"));
    })
    .catch(() => {
      notification.error({
        message: String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_APPLICATIONS));
      dispatch(hideLoading("modal"));
    });
};
