import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import queryString from "query-string";
import { request, success, error } from "@/actions/genericActions";
import * as reducerTypes from "@/constants/reducerTypes";
import * as partyActions from "@/actions/partyActions";
import * as Strings from "@/constants/strings";
import * as API from "@/constants/API";
import { ENVIRONMENT } from "@/constants/environment";
import { createRequestHeader } from "@/utils/RequestHeaders";
import CustomAxios from "@/customAxios";

export const createParty = (payload) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_PARTY));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .post(ENVIRONMENT.apiUrl + API.PARTY, payload, createRequestHeader())
    .then((response) => {
      dispatch(hideLoading("modal"));
      notification.success({ message: "Successfully created a new party", duration: 10 });
      dispatch(success(reducerTypes.CREATE_PARTY));
      dispatch(partyActions.storeLastCreatedParty(response.data));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.CREATE_PARTY));
      dispatch(hideLoading("modal"));
      throw new Error(err);
    });
};

export const updateParty = (payload, partyGuid) => (dispatch) => {
  const name = payload.first_name
    ? `${payload.first_name}  ${payload.party_name}`
    : payload.party_name;
  dispatch(request(reducerTypes.UPDATE_PARTY));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .put(`${ENVIRONMENT.apiUrl + API.PARTY}/${partyGuid}`, payload, createRequestHeader())
    .then((response) => {
      dispatch(hideLoading("modal"));
      notification.success({ message: `Successfully updated ${name}`, duration: 10 });
      dispatch(success(reducerTypes.UPDATE_PARTY));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.UPDATE_PARTY));
      dispatch(hideLoading("modal"));
      throw new Error(err);
    });
};

export const fetchParties = (params = {}) => (dispatch) => {
  dispatch(request(reducerTypes.GET_PARTIES));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.PARTIES_LIST_QUERY(params), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_PARTIES));
      dispatch(partyActions.storeParties(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_PARTIES)))
    .finally(() => dispatch(hideLoading("modal")));
};

export const fetchPartyById = (id) => (dispatch) => {
  dispatch(request(reducerTypes.GET_PARTY));
  dispatch(showLoading());
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl + API.PARTY}/${id}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_PARTY));
      dispatch(partyActions.storeParty(response.data, id));
    })
    .catch(() => dispatch(error(reducerTypes.GET_PARTY)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchPartyRelationshipTypes = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_PARTY_RELATIONSHIP_TYPES));
  dispatch(showLoading());
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl + API.PARTY}/mines/relationship-types`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_PARTY_RELATIONSHIP_TYPES));
      dispatch(partyActions.storePartyRelationshipTypes(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_PARTY_RELATIONSHIP_TYPES)))
    .finally(() => dispatch(hideLoading()));
};

export const addPartyRelationship = (payload) => (dispatch) => {
  dispatch(request(reducerTypes.ADD_PARTY_RELATIONSHIP));
  dispatch(showLoading());
  return CustomAxios()
    .post(ENVIRONMENT.apiUrl + API.PARTY_RELATIONSHIP, payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: `Successfully updated contact information`,
        duration: 10,
      });
      dispatch(success(reducerTypes.ADD_PARTY_RELATIONSHIP));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.ADD_PARTY_RELATIONSHIP)))
    .finally(() => dispatch(hideLoading()));
};

export const updatePartyRelationship = (payload) => (dispatch) => {
  dispatch(request(reducerTypes.UPDATE_PARTY_RELATIONSHIP));
  dispatch(showLoading());
  return CustomAxios()
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
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.UPDATE_PARTY_RELATIONSHIP)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchPartyRelationships = (parms) => (dispatch) => {
  dispatch(request(reducerTypes.FETCH_PARTY_RELATIONSHIPS));
  dispatch(showLoading());
  return CustomAxios()
    .get(
      `${ENVIRONMENT.apiUrl + API.PARTY_RELATIONSHIP}?${queryString.stringify(parms)}`,
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.FETCH_PARTY_RELATIONSHIPS));
      dispatch(partyActions.storePartyRelationships(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.FETCH_PARTY_RELATIONSHIPS)))
    .finally(() => dispatch(hideLoading()));
};

export const removePartyRelationship = (mine_party_appt_guid) => (dispatch) => {
  dispatch(request(reducerTypes.REMOVE_PARTY_RELATIONSHIP));
  dispatch(showLoading());
  return CustomAxios({ errorToastMessage: Strings.ERROR })
    .delete(
      `${ENVIRONMENT.apiUrl + API.PARTY_RELATIONSHIP}/${mine_party_appt_guid}`,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({ message: "Successfully removed the contact", duration: 10 });
      dispatch(success(reducerTypes.REMOVE_PARTY_RELATIONSHIP));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.REMOVE_PARTY_RELATIONSHIP)))
    .finally(() => dispatch(hideLoading()));
};

export const deleteParty = (party_guid) => (dispatch) => {
  dispatch(request(reducerTypes.DELETE_PARTY));
  dispatch(showLoading());
  return CustomAxios({ errorToastMessage: Strings.ERROR })
    .delete(`${ENVIRONMENT.apiUrl + API.PARTY}/${party_guid}`, createRequestHeader())
    .then((response) => {
      notification.success({ message: "Successfully removed the party", duration: 10 });
      dispatch(success(reducerTypes.DELETE_PARTY));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.DELETE_PARTY)))
    .finally(() => dispatch(hideLoading()));
};

export const setAddPartyFormState = (addPartyFormState) => (dispatch) => {
  dispatch(partyActions.storeAddPartyFormState(addPartyFormState));
  return addPartyFormState;
};

export const fetchInspectors = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_INSPECTORS));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .get(
      ENVIRONMENT.apiUrl +
        API.PARTIES_LIST_QUERY({
          per_page: "all",
          business_role: Strings.INCIDENT_FOLLOWUP_ACTIONS.inspector,
        }),
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.GET_INSPECTORS));
      dispatch(partyActions.storeInspectors(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_INSPECTORS)))
    .finally(() => dispatch(hideLoading("modal")));
};

export const addDocumentToRelationship = ({ mineGuid, minePartyApptGuid }, payload) => (
  dispatch
) => {
  dispatch(showLoading("modal"));
  dispatch(request(reducerTypes.ADD_DOCUMENT_TO_RELATIONSHIP));
  return CustomAxios()
    .put(
      ENVIRONMENT.apiUrl + API.MINE_PARTY_APPOINTMENT_DOCUMENTS(mineGuid, minePartyApptGuid),
      payload,
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.ADD_DOCUMENT_TO_RELATIONSHIP));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.ADD_DOCUMENT_TO_RELATIONSHIP)))
    .finally(() => dispatch(hideLoading("modal")));
};

export const removeDocumentFromVariance = (mineGuid, minePartyApptGuid, mineDocumentGuid) => (
  dispatch
) => {
  dispatch(showLoading("modal"));
  dispatch(request(reducerTypes.REMOVE_DOCUMENT_FROM_RELATIONSHIP));
  return CustomAxios()
    .delete(
      ENVIRONMENT.apiUrl +
        API.MINE_PARTY_APPOINTMENT_DOCUMENT(mineGuid, minePartyApptGuid, mineDocumentGuid),
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.REMOVE_DOCUMENT_FROM_RELATIONSHIP));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.REMOVE_DOCUMENT_FROM_RELATIONSHIP)))
    .finally(() => dispatch(hideLoading("modal")));
};
