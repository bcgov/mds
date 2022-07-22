import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { request, success, error } from "../actions/genericActions";
import * as reducerTypes from "../constants/reducerTypes";
import * as minespaceActions from "../actions/minespaceActions";
import * as String from "../constants/strings";
import * as API from "../constants/API";
import { ENVIRONMENT } from "../constants/environment";
import { createRequestHeader } from "../utils/RequestHeaders";
import CustomAxios from "../customAxios";

export const createMinespaceUser = (payload) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_MINESPACE_USER));
  dispatch(showLoading());
  return CustomAxios()
    .post(ENVIRONMENT.apiUrl + API.MINESPACE_USER, payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: `Successfully created MineSpace user.`,
        duration: 10,
      });
      dispatch(success(reducerTypes.CREATE_MINESPACE_USER));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.CREATE_MINESPACE_USER)))
    .finally(() => dispatch(hideLoading()));
};

export const updateMinespaceUserMines = (minespace_id, payload) => (dispatch) => {
  dispatch(showLoading("modal"));
  dispatch(request(reducerTypes.UPDATE_MINESPACE_USER_MINES));
  return CustomAxios()
    .put(
      ENVIRONMENT.apiUrl + API.UPDATE_MINESPACE_USER(minespace_id),
      payload,
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.UPDATE_MINESPACE_USER_MINES));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.UPDATE_MINESPACE_USER_MINES)))
    .finally(() => dispatch(hideLoading("modal")));
};

export const fetchMinespaceUsers = () => (dispatch) => {
  dispatch(showLoading());
  dispatch(request(reducerTypes.GET_MINESPACE_USER));
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.MINESPACE_USER, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINESPACE_USER));
      dispatch(minespaceActions.storeMinespaceUserList(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_MINESPACE_USER)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchMinespaceUserMines = (mine_guids) => (dispatch) => {
  dispatch(showLoading());
  dispatch(request(reducerTypes.GET_MINESPACE_USER_MINES));
  return CustomAxios()
    .post(
      ENVIRONMENT.apiUrl + API.MINE_BASIC_INFO_LIST,
      { mine_guids, simple: true },
      createRequestHeader({ timeout: 60000 })
    )
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINESPACE_USER_MINES));
      dispatch(minespaceActions.storeMinespaceUserMineList(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_MINESPACE_USER_MINES)))
    .finally(() => {
      dispatch(hideLoading());
      return true;
    });
};

export const deleteMinespaceUser = (minespaceUserId) => (dispatch) => {
  dispatch(showLoading());
  dispatch(request(reducerTypes.DELETE_MINESPACE_USER));
  return CustomAxios({ errorToastMessage: String.ERROR })
    .delete(`${ENVIRONMENT.apiUrl}${API.MINESPACE_USER}/${minespaceUserId}`, createRequestHeader())
    .then(() => {
      dispatch(success(reducerTypes.DELETE_MINESPACE_USER));
    })
    .catch(() => dispatch(error(reducerTypes.DELETE_MINESPACE_USER)))
    .finally(() => dispatch(hideLoading()));
};

// MineSpace EMLI contact
export const fetchEMLIContacts = () => (dispatch) => {
  dispatch(showLoading());
  dispatch(request(reducerTypes.GET_EMLI_CONTACTS));
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.EMLI_CONTACTS, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_EMLI_CONTACTS));
      dispatch(minespaceActions.storeEMLIContacts(response.data));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GET_EMLI_CONTACTS)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchEMLIContactsByRegion = (region, isMajorMine) => (dispatch) => {
  dispatch(showLoading());
  dispatch(request(reducerTypes.GET_EMLI_CONTACTS));
  return CustomAxios()
    .get(
      ENVIRONMENT.apiUrl + API.EMLI_CONTACTS_BY_REGION(region, isMajorMine),
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.GET_EMLI_CONTACTS));
      dispatch(minespaceActions.storeEMLIContactsByRegion(response.data));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GET_EMLI_CONTACTS)))
    .finally(() => dispatch(hideLoading()));
};

export const createEMLIContact = (payload) => (dispatch) => {
  dispatch(request(reducerTypes.UPDATE_EMLI_CONTACT));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .post(ENVIRONMENT.apiUrl + API.EMLI_CONTACTS, payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: `Successfully created a new EMLI contact.`,
        duration: 10,
      });
      dispatch(success(reducerTypes.UPDATE_EMLI_CONTACT));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.UPDATE_EMLI_CONTACT)))
    .finally(() => dispatch(hideLoading("modal")));
};

export const updateEMLIContact = (guid, payload) => (dispatch) => {
  dispatch(request(reducerTypes.UPDATE_EMLI_CONTACT));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .put(ENVIRONMENT.apiUrl + API.EMLI_CONTACT(guid), payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: `Successfully updated EMLI contact.`,
        duration: 10,
      });
      dispatch(success(reducerTypes.UPDATE_EMLI_CONTACT));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.UPDATE_EMLI_CONTACT)))
    .finally(() => dispatch(hideLoading("modal")));
};

export const deleteEMLIContact = (guid) => (dispatch) => {
  dispatch(request(reducerTypes.DELETE_EMLI_CONTACT));
  dispatch(showLoading());
  return CustomAxios()
    .delete(ENVIRONMENT.apiUrl + API.EMLI_CONTACT(guid), createRequestHeader())
    .then((response) => {
      notification.success({
        message: `Successfully deleted EMLI contact.`,
        duration: 10,
      });
      dispatch(success(reducerTypes.DELETE_EMLI_CONTACT));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.DELETE_EMLI_CONTACT)))
    .finally(() => dispatch(hideLoading()));
};
