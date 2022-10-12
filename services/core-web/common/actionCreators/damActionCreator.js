import { hideLoading, showLoading } from "react-redux-loading-bar";
import { notification } from "antd";
import { CREATE_DAM, GET_DAM } from "../constants/reducerTypes";
import { DAM, DAMS } from "../constants/API";
import { error, request, success } from "../actions/genericActions";

import CustomAxios from "../customAxios";
import { ENVIRONMENT } from "../constants/environment";
import { createRequestHeader } from "../utils/RequestHeaders";
import { storeDam } from "../actions/damActions";

export const createDam = (payload) => (dispatch) => {
  dispatch(request(CREATE_DAM));
  dispatch(showLoading());

  return CustomAxios()
    .post(`${ENVIRONMENT.apiUrl}${DAMS()}`, payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: "Successfully created new Dam",
        duration: 10,
      });
      dispatch(success(CREATE_DAM));
      return response;
    })
    .catch(() => {
      dispatch(error(CREATE_DAM));
    })
    .finally(() => dispatch(hideLoading()));
};

export const fetchDam = (damGuid) => (dispatch) => {
  dispatch(request(GET_DAM));
  dispatch(showLoading());

  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl}${DAM(damGuid)}`, createRequestHeader())
    .then((response) => {
      dispatch(success(GET_DAM));
      dispatch(storeDam(response.data));
      return response;
    })
    .catch(() => {
      dispatch(error(GET_DAM));
    })
    .finally(() => dispatch(hideLoading()));
};
