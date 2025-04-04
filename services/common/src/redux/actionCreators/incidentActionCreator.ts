import { showLoading, hideLoading } from "react-redux-loading-bar";
import { notification } from "antd";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import { request, success, error } from "../actions/genericActions";
import { NetworkReducerTypes } from "@mds/common/constants/networkReducerTypes";
import * as Strings from "@mds/common/constants/strings";
import * as incidentActions from "../actions/incidentActions";
import * as API from "@mds/common/constants/API";
import { createRequestHeader } from "../utils/RequestHeaders";
import CustomAxios from "../customAxios";
import { IMineIncident } from "@mds/common/interfaces";
import { AppThunk } from "@mds/common/interfaces/appThunk.type";
import { AxiosResponse } from "axios";


export const createMineIncident = (
  mine_guid,
  payload,
  message = "Successfully created incident."
): AppThunk<Promise<AxiosResponse<IMineIncident>>> => (dispatch): Promise<AxiosResponse<IMineIncident>> => {
  dispatch(request(NetworkReducerTypes.CREATE_MINE_INCIDENT));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .post(`${ENVIRONMENT.apiUrl}${API.MINE_INCIDENTS(mine_guid)}`, payload, createRequestHeader())
    .then((response) => {
      if (message) {
        notification.success({
          message,
          duration: 10,
        });
      }
      dispatch(success(NetworkReducerTypes.CREATE_MINE_INCIDENT));
      return response;
    })
    .catch(() => {
      dispatch(error(NetworkReducerTypes.CREATE_MINE_INCIDENT));
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const fetchMineIncidents = (params) => (dispatch) => {
  dispatch(request(NetworkReducerTypes.GET_MINE_INCIDENTS));
  dispatch(showLoading());
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl}${API.INCIDENTS(params)}`, createRequestHeader())
    .then((response) => {
      dispatch(success(NetworkReducerTypes.GET_MINE_INCIDENTS));
      dispatch(incidentActions.storeIncidents(response.data));
      return response;
    })
    .catch(() => dispatch(error(NetworkReducerTypes.GET_MINE_INCIDENTS)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchMineIncident = (mine_guid, mine_incident_guid) => (dispatch) => {
  dispatch(request(NetworkReducerTypes.GET_MINE_INCIDENT));
  dispatch(showLoading());
  return CustomAxios()
    .get(
      `${ENVIRONMENT.apiUrl}${API.MINE_INCIDENT(mine_guid, mine_incident_guid)}`,
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(NetworkReducerTypes.GET_MINE_INCIDENT));
      dispatch(incidentActions.storeMineIncident(response.data));
      return response;
    })
    .catch(() => dispatch(error(NetworkReducerTypes.GET_MINE_INCIDENT)))
    .finally(() => dispatch(hideLoading()));
};

export const updateMineIncident = (
  mineGuid,
  mineIncidentGuid,
  payload,
  message = "Successfully updated incident."
) => (dispatch) => {
  dispatch(request(NetworkReducerTypes.UPDATE_MINE_INCIDENT));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .put(
      `${ENVIRONMENT.apiUrl}${API.MINE_INCIDENT(mineGuid, mineIncidentGuid)}`,
      payload,
      createRequestHeader()
    )
    .then((response) => {
      if (message) {
        notification.success({
          message,
          duration: 10,
        });
      }
      dispatch(success(NetworkReducerTypes.UPDATE_MINE_INCIDENT));
      return response;
    })
    .catch(() => {
      dispatch(error(NetworkReducerTypes.UPDATE_MINE_INCIDENT));
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const removeDocumentFromMineIncident = (mineGuid, mineIncidentGuid, mineDocumentGuid) => (
  dispatch
) => {
  dispatch(showLoading());
  dispatch(request(NetworkReducerTypes.REMOVE_DOCUMENT_FROM_MINE_INCIDENT));
  return CustomAxios()
    .delete(
      ENVIRONMENT.apiUrl + API.MINE_INCIDENT_DOCUMENT(mineGuid, mineIncidentGuid, mineDocumentGuid),
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Successfully deleted mine incident document.",
        duration: 10,
      });
      dispatch(success(NetworkReducerTypes.REMOVE_DOCUMENT_FROM_MINE_INCIDENT));
      return response;
    })
    .catch(() => {
      dispatch(error(NetworkReducerTypes.REMOVE_DOCUMENT_FROM_MINE_INCIDENT));
    })
    .finally(() => dispatch(hideLoading()));
};

export const fetchIncidents = (payload) => (dispatch) => {
  dispatch(request(NetworkReducerTypes.GET_INCIDENTS));
  dispatch(showLoading());
  return CustomAxios({ errorToastMessage: Strings.ERROR })
    .get(ENVIRONMENT.apiUrl + API.INCIDENTS(payload), createRequestHeader())
    .then((response) => {
      dispatch(success(NetworkReducerTypes.GET_INCIDENTS));
      dispatch(incidentActions.storeIncidents(response.data));
    })
    .catch(() => dispatch(error(NetworkReducerTypes.GET_INCIDENTS)))
    .finally(() => dispatch(hideLoading()));
};

export const deleteMineIncident = (mineGuid, mineIncidentGuid) => (dispatch) => {
  dispatch(request(NetworkReducerTypes.DELETE_MINE_INCIDENT));
  dispatch(showLoading());
  return CustomAxios()
    .delete(
      `${ENVIRONMENT.apiUrl}${API.MINE_INCIDENT(mineGuid, mineIncidentGuid)}`,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Successfully deleted incident.",
        duration: 10,
      });
      dispatch(success(NetworkReducerTypes.DELETE_MINE_INCIDENT));
      return response;
    })
    .catch(() => {
      dispatch(error(NetworkReducerTypes.DELETE_MINE_INCIDENT));
    })
    .finally(() => dispatch(hideLoading()));
};

// Notes
export const fetchMineIncidentNotes = (mineIncidentGuid) => (dispatch) => {
  dispatch(request(NetworkReducerTypes.GET_MINE_INCIDENT_NOTES));
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl}${API.INCIDENT_NOTES(mineIncidentGuid)}`, createRequestHeader())
    .then((response) => {
      dispatch(success(NetworkReducerTypes.GET_MINE_INCIDENT_NOTES));
      dispatch(incidentActions.storeMineIncidentNotes(response.data));
      return response;
    })
    .catch(() => dispatch(error(NetworkReducerTypes.GET_MINE_INCIDENT_NOTES)));
};

export const createMineIncidentNote = (mineIncidentGuid, payload) => (dispatch) => {
  dispatch(request(NetworkReducerTypes.CREATE_MINE_INCIDENT_NOTE));
  return CustomAxios()
    .post(
      `${ENVIRONMENT.apiUrl}${API.INCIDENT_NOTES(mineIncidentGuid)}`,
      payload,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Successfully added note.",
        duration: 10,
      });
      dispatch(success(NetworkReducerTypes.CREATE_MINE_INCIDENT_NOTE));
      return response;
    })
    .catch(() => {
      dispatch(error(NetworkReducerTypes.CREATE_MINE_INCIDENT_NOTE));
    });
};

export const deleteMineIncidentNote = (mineIncidentGuid, mineIncidentNoteGuid) => (dispatch) => {
  dispatch(request(NetworkReducerTypes.DELETE_MINE_INCIDENT_NOTE));
  return CustomAxios()
    .delete(
      `${ENVIRONMENT.apiUrl}${API.INCIDENT_NOTE(mineIncidentGuid, mineIncidentNoteGuid)}`,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Successfully deleted note.",
        duration: 10,
      });
      dispatch(success(NetworkReducerTypes.DELETE_MINE_INCIDENT_NOTE));
      return response;
    })
    .catch(() => {
      dispatch(error(NetworkReducerTypes.DELETE_MINE_INCIDENT_NOTE));
    });
};
