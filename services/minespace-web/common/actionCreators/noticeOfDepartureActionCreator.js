import { notification } from "antd";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import { error, request, success } from "../actions/genericActions";
import {
  CREATE_NOTICE_OF_DEPARTURE,
  ADD_DOCUMENT_TO_NOTICE_OF_DEPARTURE,
  GET_NOTICES_OF_DEPARTURE,
  GET_DETAILED_NOTICE_OF_DEPARTURE,
} from "../constants/reducerTypes";
import CustomAxios from "../customAxios";
import { ENVIRONMENT } from "../constants/environment";
import {
  NOTICES_OF_DEPARTURE,
  NOTICES_OF_DEPARTURE_DOCUMENTS,
  NOTICE_OF_DEPARTURE,
} from "../constants/API";
import { createRequestHeader } from "../utils/RequestHeaders";
import { storeNoticesOfDeparture } from "../actions/noticeOfDepartureActions";

export const createNoticeOfDeparture = (mine_guid, payload) => (dispatch) => {
  dispatch(request(CREATE_NOTICE_OF_DEPARTURE));
  dispatch(showLoading("modal"));

  return CustomAxios()
    .post(`${ENVIRONMENT.apiUrl}${NOTICES_OF_DEPARTURE(mine_guid)}`, payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: "Successfully created notice of departure.",
        duration: 10,
      });
      dispatch(success(CREATE_NOTICE_OF_DEPARTURE));
      return response;
    })
    .catch((err) => {
      dispatch(error(CREATE_NOTICE_OF_DEPARTURE));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const fetchNoticesOfDeparture = (mine_guid) => (dispatch) => {
  dispatch(request(GET_NOTICES_OF_DEPARTURE));
  dispatch(showLoading());
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl}${NOTICES_OF_DEPARTURE(mine_guid)}`, createRequestHeader())
    .then((response) => {
      dispatch(success(GET_NOTICES_OF_DEPARTURE));
      dispatch(storeNoticesOfDeparture(response.data));
      return response;
    })
    .catch(() => dispatch(error(GET_NOTICES_OF_DEPARTURE)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchDetailedNoticeOfDeparture = (mine_guid, nod_guid) => (dispatch) => {
  dispatch(request(GET_DETAILED_NOTICE_OF_DEPARTURE));
  dispatch(showLoading());
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl}${NOTICE_OF_DEPARTURE(mine_guid, nod_guid)}`, createRequestHeader())
    .then((response) => {
      dispatch(success(GET_DETAILED_NOTICE_OF_DEPARTURE));
      return response;
    })
    .catch(() => dispatch(error(GET_DETAILED_NOTICE_OF_DEPARTURE)))
    .finally(() => dispatch(hideLoading()));
};

export const addDocumentToNoticeOfDeparture = ({ mineGuid, noticeOfDepartureGuid }, payload) => (
  dispatch
) => {
  dispatch(showLoading("modal"));
  dispatch(request(ADD_DOCUMENT_TO_NOTICE_OF_DEPARTURE));
  return CustomAxios()
    .put(
      `${ENVIRONMENT.apiUrl}${NOTICES_OF_DEPARTURE_DOCUMENTS(mineGuid, noticeOfDepartureGuid)}`,
      payload,
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(ADD_DOCUMENT_TO_NOTICE_OF_DEPARTURE));
      return response;
    })
    .catch((err) => {
      dispatch(error(ADD_DOCUMENT_TO_NOTICE_OF_DEPARTURE));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading("modal")));
};
