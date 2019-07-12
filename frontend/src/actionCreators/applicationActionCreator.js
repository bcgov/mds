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
import CustomAxios from "@/customAxios";

export const fetchApplications = (params = {}) => (dispatch) => {
  dispatch(request(reducerTypes.GET_APPLICATIONS));
  dispatch(showLoading("modal"));
  return CustomAxios({ errorToastMessage: String.ERROR })
    .get(
      `${ENVIRONMENT.apiUrl + API.APPLICATIONS}?${queryString.stringify(params)}`,
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.GET_APPLICATIONS));
      dispatch(applicationActions.storeApplications(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_APPLICATIONS)))
    .finally(() => dispatch(hideLoading("modal")));
};

export const updateApplication = (application_guid, payload) => (dispatch) => {
  dispatch(request(reducerTypes.UPDATE_APPLICATION));
  dispatch(showLoading());
  return CustomAxios()
    .put(
      `${ENVIRONMENT.apiUrl + API.APPLICATIONS}/${application_guid}`,
      payload,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: `Successfully updated application`,
        duration: 10,
      });
      dispatch(success(reducerTypes.UPDATE_APPLICATION));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.UPDATE_APPLICATION)))
    .finally(() => dispatch(hideLoading()));
};

export const createApplication = (payload) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_APPLICAION));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .post(`${ENVIRONMENT.apiUrl + API.APPLICATIONS}`, payload, createRequestHeader())
    .then((response) => {
      notification.success({ message: "Successfully created a new application", duration: 10 });
      dispatch(success(reducerTypes.CREATE_APPLICAION));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.CREATE_APPLICAION)))
    .finally(() => dispatch(hideLoading("modal")));
};
