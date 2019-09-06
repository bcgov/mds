import axios from "axios";
import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { request, success, error } from "@/actions/genericActions";
import * as reducerTypes from "@/constants/reducerTypes";
import * as mineReportActions from "@/actions/mineReportActions";
import * as API from "@/constants/API";
import { ENVIRONMENT } from "@/constants/environment";
import { createRequestHeader } from "@/utils/RequestHeaders";

export const fetchMineReports = (mineGuid) => (dispatch) => {
  dispatch(showLoading());
  dispatch(request(reducerTypes.GET_MINE_REPORTS));
  return axios
    .get(`${ENVIRONMENT.apiUrl}${API.MINE_REPORTS(mineGuid)}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_REPORTS));
      dispatch(mineReportActions.storeMineReports(response.data));
      dispatch(hideLoading());
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_MINE_REPORTS));
      dispatch(hideLoading());
    });
};

export const updateMineReport = (mineGuid, mineReportGuid, payload) => (dispatch) => {
  dispatch(request(reducerTypes.UPDATE_MINE_REPORT));
  return axios
    .put(
      `${ENVIRONMENT.apiUrl}${API.MINE_REPORT(mineGuid, mineReportGuid)}`,
      payload,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Successfully updated report.",
        duration: 10,
      });
      dispatch(success(reducerTypes.UPDATE_MINE_REPORT));
      return response;
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_MINE_REPORTS));
      dispatch(hideLoading());
    });
};
