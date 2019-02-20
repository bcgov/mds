import axios from "axios";
import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { request, success, error } from "@/actions/genericActions";
import * as reducerTypes from "@/constants/reducerTypes";
import * as partyActions from "@/actions/partyActions";
import * as String from "@/constants/strings";
import * as API from "@/constants/API";
import { ENVIRONMENT } from "@/constants/environment";
import { createRequestHeader } from "@/utils/RequestHeaders";
import queryString from "query-string";

export const createParty = (payload) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_PARTY));
  dispatch(showLoading("modal"));
  return axios
    .post(ENVIRONMENT.apiUrl + API.PARTY, payload, createRequestHeader())
    .then((response) => {
      notification.success({ message: "Successfully created a new party", duration: 10 });
      dispatch(success(reducerTypes.CREATE_PARTY));
      dispatch(hideLoading("modal"));
      return response;
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.CREATE_PARTY));
      dispatch(hideLoading("modal"));
    });
};

export const fetchParties = (value = null) => (dispatch) => {
  dispatch(request(reducerTypes.GET_PARTIES));
  dispatch(showLoading("modal"));
  return axios
    .get(ENVIRONMENT.apiUrl + API.PARTIES(value), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_PARTIES));
      dispatch(partyActions.storeParties(response.data));
      dispatch(hideLoading("modal"));
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_PARTIES));
      dispatch(hideLoading("modal"));
    });
};

export const fetchPartyById = (id) => (dispatch) => {
  dispatch(request(reducerTypes.GET_PARTY));
  dispatch(showLoading());
  return axios
    .get(`${ENVIRONMENT.apiUrl + API.PARTY}/${id}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_PARTY));
      dispatch(partyActions.storeParty(response.data, id));
      dispatch(hideLoading());
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_PARTY));
      dispatch(hideLoading());
    });
};

export const fetchPartyRelationshipTypes = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_PARTY_RELATIONSHIP_TYPES));
  dispatch(showLoading());
  return axios
    .get(`${ENVIRONMENT.apiUrl + API.PARTY}/mines/relationship-types`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_PARTY_RELATIONSHIP_TYPES));
      dispatch(partyActions.storePartyRelationshipTypes(response.data));
      dispatch(hideLoading());
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_PARTY_RELATIONSHIP_TYPES));
      dispatch(hideLoading());
    });
};

export const addPartyRelationship = (payload) => (dispatch) => {
  dispatch(request(reducerTypes.ADD_PARTY_RELATIONSHIP));
  dispatch(showLoading());
  return axios
    .post(ENVIRONMENT.apiUrl + API.PARTY_RELATIONSHIP, payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: `Successfully updated contact information`,
        duration: 10,
      });
      dispatch(success(reducerTypes.ADD_PARTY_RELATIONSHIP));
      dispatch(hideLoading());
      return response;
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.ADD_PARTY_RELATIONSHIP));
      dispatch(hideLoading());
    });
};

export const updatePartyRelationship = (payload) => (dispatch) => {
  dispatch(request(reducerTypes.UPDATE_PARTY_RELATIONSHIP));
  dispatch(showLoading());
  return axios
    .put(
      `${ENVIRONMENT.apiUrl + API.PARTY_RELATIONSHIP}/${payload.mine_party_appt_guid}`,
      payload,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: `Successfully updated contact information`,
        duration: 10,
      });
      dispatch(success(reducerTypes.UPDATE_PARTY_RELATIONSHIP));
      dispatch(hideLoading());
      return response;
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.UPDATE_PARTY_RELATIONSHIP));
      dispatch(hideLoading());
    });
};

export const fetchPartyRelationships = (parms) => (dispatch) => {
  dispatch(request(reducerTypes.FETCH_PARTY_RELATIONSHIPS));
  dispatch(showLoading());
  return axios
    .get(
      `${ENVIRONMENT.apiUrl + API.PARTY_RELATIONSHIP}?${queryString.stringify(parms)}`,
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.FETCH_PARTY_RELATIONSHIPS));
      dispatch(partyActions.storePartyRelationships(response.data));
      dispatch(hideLoading());
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.FETCH_PARTY_RELATIONSHIPS));
      dispatch(hideLoading());
    });
};

export const removePartyRelationship = (mine_party_appt_guid) => (dispatch) => {
  dispatch(request(reducerTypes.REMOVE_PARTY_RELATIONSHIP));
  dispatch(showLoading());
  return axios
    .delete(
      `${ENVIRONMENT.apiUrl + API.PARTY_RELATIONSHIP}/${mine_party_appt_guid}`,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({ message: "Successfully removed the contact", duration: 10 });
      dispatch(success(reducerTypes.REMOVE_PARTY_RELATIONSHIP));
      dispatch(hideLoading());
      return response;
    })
    .catch(() => {
      notification.error({ message: String.ERROR, duration: 10 });
      dispatch(error(reducerTypes.REMOVE_PARTY_RELATIONSHIP));
      dispatch(hideLoading());
    });
};

export const downloadMineManagerHistory = (mineNo, { window, document }) =>
  axios({
    method: "GET",
    url: `${ENVIRONMENT.apiUrl + API.MINE_MANAGER_HISTORY(mineNo)}`,
    responseType: "blob",
    ...createRequestHeader(),
  })
    .then((response) => {
      notification.success({ message: "Successfully downloaded history", duration: 10 });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `mine_${mineNo}_manager_history.csv`);
      document.body.appendChild(link);
      link.click();
      return response;
    })
    .catch(({ response }) => {
      let message = "Download failed";
      if (response.status === 422) {
        message = "No Mine Number provided";
      }
      if (response.status === 404) {
        message = "No Mine Manager history found";
      }
      notification.error({ message, duration: 10 });
    });
