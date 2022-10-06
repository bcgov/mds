import { hideLoading, showLoading } from "react-redux-loading-bar";

import { CREATE_DAM } from "../constants/reducerTypes";
import CustomAxios from "../customAxios";
import { DAMS } from "../constants/API";
import { ENVIRONMENT } from "../constants/environment";
import { createRequestHeader } from "@/utils/RequestHeaders";
import { notification } from "antd";

export const createDam = (tsfGuid, payload) => (dispatch) => {
  dispatch(request(CREATE_DAM));
  dispatch(showLoading());

  return CustomAxios()
    .post(`${ENVIRONMENT.apiUrl}${DAMS(tsfGuid)}`, payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: "Successfully created new Dam",
        duration: 10,
      });
      dispatch(success(CREATE_DAM));
      return response;
    })
    .catch((err) => {
      dispatch(error(CREATE_DAM));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading()));
};
