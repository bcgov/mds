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

export const addPermittee = (permitteeId, permitId, partyId, mineName, date) => (dispatch) => {
  dispatch(request(reducerTypes.ADD_PERMITTEE));
  dispatch(showLoading());
  return axios
    .post(
      ENVIRONMENT.apiUrl + API.PERMITTEE,
      {
        permittee_guid: permitteeId,
        permit_guid: permitId,
        party_guid: partyId,
        effective_date: date,
      },
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: `Successfully updated the permittee of ${mineName}`,
        duration: 10,
      });
      dispatch(success(reducerTypes.ADD_PERMITTEE));
      dispatch(hideLoading());
      return response;
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.ADD_PERMITTEE));
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
        message: `Successfully created contact`,
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
        message: `Successfully updated contact`,
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

export const fetchPartyRelationships = (mineId, partyId, typeCode) => (dispatch) => {
  dispatch(request(reducerTypes.FETCH_PARTY_RELATIONSHIPS));
  dispatch(showLoading());
  return axios
    .get(
      `${ENVIRONMENT.apiUrl + API.PARTY_RELATIONSHIP}?${
        mineId ? `mine_guid=${mineId}${partyId || typeCode ? "&" : ""}` : ""
      }${partyId ? `party_guid=${partyId}${typeCode ? "&" : ""}` : ""}${
        typeCode ? `types=${typeCode}` : ""
      }`,
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.FETCH_PARTY_RELATIONSHIPS));
      dispatch(partyActions.storePartyRelationships(response.data));
      dispatch(hideLoading("modal"));
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

export const fetchPartyRelationshipsByMineId = (mineId) => (dispatch) => {
  dispatch(request(reducerTypes.FETCH_PARTY_RELATIONSHIPS));
  dispatch(showLoading());
  return axios
    .get(
      `${ENVIRONMENT.apiUrl + API.PARTY_RELATIONSHIP}?mine_guid=${mineId}`,
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

export const fetchPartyRelationshipsByPartyId = (partyId) => (dispatch) => {
  dispatch(request(reducerTypes.FETCH_PARTY_RELATIONSHIPS));
  dispatch(showLoading());
  return axios
    .get(
      `${ENVIRONMENT.apiUrl + API.PARTY_RELATIONSHIP}?party_guid=${partyId}`,
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

export const fetchPartyRelationshipsByTypeCode = (typeCode) => (dispatch) => {
  dispatch(request(reducerTypes.FETCH_PARTY_RELATIONSHIPS));
  dispatch(showLoading());
  return axios
    .get(`${ENVIRONMENT.apiUrl + API.PARTY_RELATIONSHIP}?types=${typeCode}`, createRequestHeader())
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
