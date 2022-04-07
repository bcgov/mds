import { notification } from "antd";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import { error, request, success } from "../actions/genericActions";
import * as reducerTypes from "../constants/reducerTypes";
import CustomAxios from "../customAxios";
import { ENVIRONMENT } from "../constants/environment";
import * as API from "../constants/API";
import { createRequestHeader } from "../utils/RequestHeaders";
import * as noticeOfDepartureActions from "../actions/noticeOfDepartureActions";

export const createNoticeOfDeparture = (mine_guid, payload) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_NOTICE_OF_DEPARTURE));
  dispatch(showLoading("modal"));

  return CustomAxios()
    .post(
      `${ENVIRONMENT.apiUrl}${API.NOTICES_OF_DEPARTURE(mine_guid)}`,
      payload,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Successfully created notice of departure.",
        duration: 10,
      });
      dispatch(success(reducerTypes.CREATE_NOTICE_OF_DEPARTURE));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.CREATE_NOTICE_OF_DEPARTURE));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const fetchNoticesOfDeparture = (mine_guid) => (dispatch) => {
  dispatch(request(reducerTypes.GET_NOTICES_OF_DEPARTURE));
  dispatch(showLoading());
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl}${API.NOTICES_OF_DEPARTURE(mine_guid)}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_NOTICES_OF_DEPARTURE));
      dispatch(noticeOfDepartureActions.storeNoticesOfDeparture(response.data));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GET_NOTICES_OF_DEPARTURE)))
    .finally(() => dispatch(hideLoading()));
};
