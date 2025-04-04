import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import { request, success, error } from "../actions/genericActions";
import { NetworkReducerTypes } from "@mds/common/constants/networkReducerTypes";
import * as minespaceActions from "../actions/minespaceActions";
import * as String from "@mds/common/constants/strings";
import * as API from "@mds/common/constants/API";
import { createRequestHeader } from "../utils/RequestHeaders";
import CustomAxios from "../customAxios";

export const createMinespaceUser = (payload) => (dispatch) => {
  dispatch(request(NetworkReducerTypes.CREATE_MINESPACE_USER));
  dispatch(showLoading());
  return CustomAxios()
    .post(ENVIRONMENT.apiUrl + API.MINESPACE_USER, payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: `Successfully created MineSpace user.`,
        duration: 10,
      });
      dispatch(success(NetworkReducerTypes.CREATE_MINESPACE_USER));
      return response;
    })
    .catch(() => dispatch(error(NetworkReducerTypes.CREATE_MINESPACE_USER)))
    .finally(() => dispatch(hideLoading()));
};

export const updateMinespaceUserMines = (minespace_id, payload) => (dispatch) => {
  dispatch(showLoading("modal"));
  dispatch(request(NetworkReducerTypes.UPDATE_MINESPACE_USER_MINES));
  return CustomAxios()
    .put(
      ENVIRONMENT.apiUrl + API.UPDATE_MINESPACE_USER(minespace_id),
      payload,
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(NetworkReducerTypes.UPDATE_MINESPACE_USER_MINES));
      return response;
    })
    .catch(() => dispatch(error(NetworkReducerTypes.UPDATE_MINESPACE_USER_MINES)))
    .finally(() => dispatch(hideLoading("modal")));
};

export const fetchMinespaceUsers = () => (dispatch) => {
  dispatch(showLoading());
  dispatch(request(NetworkReducerTypes.GET_MINESPACE_USER));
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.MINESPACE_USER, createRequestHeader())
    .then((response) => {
      dispatch(success(NetworkReducerTypes.GET_MINESPACE_USER));
      dispatch(minespaceActions.storeMinespaceUserList(response.data));
    })
    .catch(() => dispatch(error(NetworkReducerTypes.GET_MINESPACE_USER)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchMinespaceUserMines = (mine_guids) => (dispatch) => {
  dispatch(showLoading());
  dispatch(request(NetworkReducerTypes.GET_MINESPACE_USER_MINES));
  return CustomAxios()
    .post(
      ENVIRONMENT.apiUrl + API.MINE_BASIC_INFO_LIST,
      { mine_guids, simple: true },
      createRequestHeader({ timeout: 60000 })
    )
    .then((response) => {
      dispatch(success(NetworkReducerTypes.GET_MINESPACE_USER_MINES));
      dispatch(minespaceActions.storeMinespaceUserMineList(response.data));
    })
    .catch(() => dispatch(error(NetworkReducerTypes.GET_MINESPACE_USER_MINES)))
    .finally(() => {
      dispatch(hideLoading());
      return true;
    });
};

export const deleteMinespaceUser = (minespaceUserId) => (dispatch) => {
  dispatch(showLoading());
  dispatch(request(NetworkReducerTypes.DELETE_MINESPACE_USER));
  return CustomAxios({ errorToastMessage: String.ERROR })
    .delete(`${ENVIRONMENT.apiUrl}${API.MINESPACE_USER}/${minespaceUserId}`, createRequestHeader())
    .then(() => {
      dispatch(success(NetworkReducerTypes.DELETE_MINESPACE_USER));
    })
    .catch(() => dispatch(error(NetworkReducerTypes.DELETE_MINESPACE_USER)))
    .finally(() => dispatch(hideLoading()));
};

// MineSpace MCM contact
export const fetchMinistryContacts = () => (dispatch) => {
  dispatch(showLoading());
  dispatch(request(NetworkReducerTypes.GET_MINISTRY_CONTACTS));
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.MINISTRY_CONTACTS, createRequestHeader())
    .then((response) => {
      dispatch(success(NetworkReducerTypes.GET_MINISTRY_CONTACTS));
      dispatch(minespaceActions.storeMinistryContacts(response.data));
      return response;
    })
    .catch(() => dispatch(error(NetworkReducerTypes.GET_MINISTRY_CONTACTS)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchMinistryContactsByRegion = (region, isMajorMine) => (dispatch) => {
  dispatch(showLoading());
  dispatch(request(NetworkReducerTypes.GET_MINISTRY_CONTACTS));
  return CustomAxios()
    .get(
      ENVIRONMENT.apiUrl + API.MINISTRY_CONTACTS_BY_REGION(region, isMajorMine),
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(NetworkReducerTypes.GET_MINISTRY_CONTACTS));
      dispatch(minespaceActions.storeMinistryContactsByRegion(response.data));
      return response;
    })
    .catch(() => dispatch(error(NetworkReducerTypes.GET_MINISTRY_CONTACTS)))
    .finally(() => dispatch(hideLoading()));
};

export const createMinistryContact = (payload) => (dispatch) => {
  dispatch(request(NetworkReducerTypes.UPDATE_MINISTRY_CONTACT));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .post(ENVIRONMENT.apiUrl + API.MINISTRY_CONTACTS, payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: `Successfully created a new MCM contact.`,
        duration: 10,
      });
      dispatch(success(NetworkReducerTypes.UPDATE_MINISTRY_CONTACT));
      return response;
    })
    .catch(() => dispatch(error(NetworkReducerTypes.UPDATE_MINISTRY_CONTACT)))
    .finally(() => dispatch(hideLoading("modal")));
};

export const updateMinistryContact = (guid, payload) => (dispatch) => {
  dispatch(request(NetworkReducerTypes.UPDATE_MINISTRY_CONTACT));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .put(ENVIRONMENT.apiUrl + API.MINISTRY_CONTACT(guid), payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: `Successfully updated MCM contact.`,
        duration: 10,
      });
      dispatch(success(NetworkReducerTypes.UPDATE_MINISTRY_CONTACT));
      return response;
    })
    .catch(() => dispatch(error(NetworkReducerTypes.UPDATE_MINISTRY_CONTACT)))
    .finally(() => dispatch(hideLoading("modal")));
};

export const deleteMinistryContact = (guid) => (dispatch) => {
  dispatch(request(NetworkReducerTypes.DELETE_MINISTRY_CONTACT));
  dispatch(showLoading());
  return CustomAxios()
    .delete(ENVIRONMENT.apiUrl + API.MINISTRY_CONTACT(guid), createRequestHeader())
    .then((response) => {
      notification.success({
        message: `Successfully deleted MCM contact.`,
        duration: 10,
      });
      dispatch(success(NetworkReducerTypes.DELETE_MINISTRY_CONTACT));
      return response;
    })
    .catch(() => dispatch(error(NetworkReducerTypes.DELETE_MINISTRY_CONTACT)))
    .finally(() => dispatch(hideLoading()));
};
