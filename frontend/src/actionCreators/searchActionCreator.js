import axios from "axios";
import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { request, success, error } from "@/actions/genericActions";
import * as reducerTypes from "@/constants/reducerTypes";
import * as searchActions from "@/actions/searchActions";
import * as String from "@/constants/strings";
import * as API from "@/constants/API";
import { ENVIRONMENT } from "@/constants/environment";
import { createRequestHeader } from "@/utils/RequestHeaders";

// This file is anticipated to have multiple exports
// eslint-disable-next-line import/prefer-default-export
export const fetchSearchResults = (searchTerm) => (dispatch) => {
  dispatch(request(reducerTypes.GET_SEARCH_RESULTS));
  dispatch(showLoading("modal"));
  return axios
    .get(`${ENVIRONMENT.apiUrl + API.SEARCH}?search_term=${searchTerm}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_SEARCH_RESULTS));
      dispatch(searchActions.storeSearchResults(response.data));
      dispatch(hideLoading("modal"));
    })
    .catch(() => {
      notification.error({
        message: String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_SEARCH_RESULTS));
      dispatch(hideLoading("modal"));
    });
};
