import { showLoading, hideLoading } from "react-redux-loading-bar";
import { notification } from "antd";
import { request, success, error } from "../actions/genericActions";
import * as reducerTypes from "../constants/reducerTypes";
import * as Strings from "../constants/strings";
import * as incidentActions from "../actions/incidentActions";
import * as API from "../constants/API";
import { ENVIRONMENT } from "../constants/environment";
import { createRequestHeader } from "../utils/RequestHeaders";
import CustomAxios from "../customAxios";

export const createMineIncident = (mine_guid, payload) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_MINE_INCIDENT));
  return CustomAxios()
    .post(`${ENVIRONMENT.apiUrl}${API.MINE_INCIDENTS(mine_guid)}`, payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: "Successfully created incident.",
        duration: 10,
      });
      dispatch(success(reducerTypes.CREATE_MINE_INCIDENT));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.CREATE_MINE_INCIDENT)));
};

export const fetchMineIncidents = (mine_guid) => (dispatch) => {
  dispatch(request(reducerTypes.GET_MINE_INCIDENTS));
  dispatch(showLoading());
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl}${API.MINE_INCIDENTS(mine_guid)}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_INCIDENTS));
      dispatch(incidentActions.storeMineIncidents(response.data));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GET_MINE_INCIDENTS)))
    .finally(() => dispatch(hideLoading()));
};

export const updateMineIncident = (mineGuid, mineIncidentGuid, payload) => (dispatch) => {
  dispatch(request(reducerTypes.UPDATE_MINE_INCIDENT));
  return CustomAxios()
    .put(
      `${ENVIRONMENT.apiUrl}${API.MINE_INCIDENT(mineGuid, mineIncidentGuid)}`,
      payload,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Successfully updated incident.",
        duration: 10,
      });
      dispatch(success(reducerTypes.UPDATE_MINE_INCIDENT));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.UPDATE_MINE_INCIDENT)));
};

export const fetchIncidents = (payload) => (dispatch) => {
  dispatch(request(reducerTypes.GET_INCIDENTS));
  dispatch(showLoading());
  return CustomAxios({ errorToastMessage: Strings.ERROR })
    .get(ENVIRONMENT.apiUrl + API.INCIDENTS(payload), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_INCIDENTS));
      dispatch(incidentActions.storeIncidents(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_INCIDENTS)))
    .finally(() => dispatch(hideLoading()));
};
