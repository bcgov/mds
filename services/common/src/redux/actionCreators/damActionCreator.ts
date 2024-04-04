import { hideLoading, showLoading } from "react-redux-loading-bar";
import { notification } from "antd";
import { ENVIRONMENT } from "@mds/common/constants";
import { CREATE_DAM, GET_DAM, UPDATE_DAM } from "@mds/common/constants/reducerTypes";
import { DAM, DAMS } from "@mds/common/constants/API";
import { error, request, success } from "../actions/genericActions";

import CustomAxios from "../customAxios";
import { createRequestHeader } from "../utils/RequestHeaders";
import { storeDam } from "../actions/damActions";
import { ICreateDam, IDam } from "@mds/common/interfaces";
import { AppThunk } from "@mds/common/interfaces/appThunk.type";
import { AxiosResponse } from "axios";

export const createDam = (payload: ICreateDam): AppThunk<Promise<AxiosResponse<IDam>>> => (
  dispatch
): Promise<AxiosResponse<IDam>> => {
  dispatch(request(CREATE_DAM));
  dispatch(showLoading());

  return CustomAxios()
    .post(`${ENVIRONMENT.apiUrl}${DAMS()}`, payload, createRequestHeader())
    .then((response: AxiosResponse<IDam>) => {
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

export const updateDam = (
  damGuid: string,
  payload: Partial<IDam>
): AppThunk<Promise<AxiosResponse<IDam>>> => (dispatch): Promise<AxiosResponse<IDam>> => {
  dispatch(request(UPDATE_DAM));
  dispatch(showLoading());

  return CustomAxios()
    .patch(`${ENVIRONMENT.apiUrl}${DAM(damGuid)}`, payload, createRequestHeader())
    .then((response) => {
      dispatch(success(UPDATE_DAM));
      dispatch(storeDam(response.data));
      return response;
    })
    .catch(() => {
      dispatch(error(UPDATE_DAM));
    })
    .finally(() => dispatch(hideLoading()));
};

export const fetchDam = (damGuid: string): AppThunk<Promise<AxiosResponse<IDam>>> => (
  dispatch
): Promise<AxiosResponse<IDam>> => {
  dispatch(request(GET_DAM));
  dispatch(showLoading());

  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl}${DAM(damGuid)}`, createRequestHeader())
    .then((response: AxiosResponse<IDam>) => {
      dispatch(success(GET_DAM));
      dispatch(storeDam(response.data));
      return response;
    })
    .catch(() => {
      dispatch(error(GET_DAM));
    })
    .finally(() => dispatch(hideLoading()));
};
