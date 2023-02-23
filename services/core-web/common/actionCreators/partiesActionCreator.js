import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import queryString from "query-string";
import { ENVIRONMENT } from "@mds/common";
import { request, success, error } from "../actions/genericActions";
import * as reducerTypes from "../constants/reducerTypes";
import * as partyActions from "../actions/partyActions";
import * as Strings from "../constants/strings";
import * as API from "../constants/API";
import { createRequestHeader } from "../utils/RequestHeaders";
import CustomAxios from "../customAxios";

const removeNullValues = (obj) => {
  Object.keys(obj).forEach((key) => obj[key] === null && delete obj[key]);
  return obj;
};

export const createParty = (payload) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_PARTY));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .post(ENVIRONMENT.apiUrl + API.PARTY, payload, createRequestHeader())
    .then((response) => {
      dispatch(hideLoading("modal"));
      notification.success({
        message: "Successfully created a new contact",
        duration: 10,
      });
      dispatch(success(reducerTypes.CREATE_PARTY));
      dispatch(partyActions.storeLastCreatedParty(response.data));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.CREATE_PARTY));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading("modal")));
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
      notification.success({
        message: `Successfully updated ${name}`,
        duration: 10,
      });
      dispatch(success(reducerTypes.UPDATE_PARTY));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.UPDATE_PARTY));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const fetchParties =
  (params = {}) =>
  (dispatch) => {
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
    .catch((err) => {
      dispatch(error(reducerTypes.GET_PARTY));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading()));
};

export const addPartyRelationship =
  (payload, successMessage = null) =>
  (dispatch) => {
    dispatch(request(reducerTypes.ADD_PARTY_RELATIONSHIP));
    dispatch(showLoading("modal"));
    return CustomAxios()
      .post(ENVIRONMENT.apiUrl + API.PARTY_RELATIONSHIP, payload, createRequestHeader())
      .then((response) => {
        notification.success({
          message: successMessage || `Successfully updated contact information`,
          duration: 10,
        });
        dispatch(success(reducerTypes.ADD_PARTY_RELATIONSHIP));
        return response;
      })
      .catch((err) => {
        dispatch(error(reducerTypes.ADD_PARTY_RELATIONSHIP));
        throw new Error(err);
      })
      .finally(() => dispatch(hideLoading("modal")));
  };

export const updatePartyRelationship =
  (payload, successMessage = null) =>
  (dispatch) => {
    dispatch(request(reducerTypes.UPDATE_PARTY_RELATIONSHIP));
    dispatch(showLoading("modal"));
    const sanitizedPayload = removeNullValues(payload);
    return CustomAxios()
      .put(
        `${ENVIRONMENT.apiUrl + API.PARTY_RELATIONSHIP}/${payload.mine_party_appt_guid}`,
        sanitizedPayload,
        createRequestHeader()
      )
      .then((response) => {
        notification.success({
          message: successMessage || `Successfully updated contact information`,
          duration: 10,
        });
        dispatch(success(reducerTypes.UPDATE_PARTY_RELATIONSHIP));
        return response;
      })
      .catch((err) => {
        dispatch(error(reducerTypes.UPDATE_PARTY_RELATIONSHIP));
        throw new Error(err);
      })
      .finally(() => dispatch(hideLoading("modal")));
  };

export const fetchPartyRelationships = (params) => (dispatch) => {
  dispatch(request(reducerTypes.FETCH_PARTY_RELATIONSHIPS));
  dispatch(showLoading());
  return CustomAxios()
    .get(
      `${ENVIRONMENT.apiUrl + API.PARTY_RELATIONSHIP}?${queryString.stringify(params)}`,
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.FETCH_PARTY_RELATIONSHIPS));
      dispatch(
        partyActions.storePartyRelationships(
          response.data,
          params.mine_tailings_storage_facility_guid
        )
      );
      return response.data;
    })
    .catch(() => dispatch(error(reducerTypes.FETCH_PARTY_RELATIONSHIPS)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchAllPartyRelationships = (params) => (dispatch) => {
  dispatch(request(reducerTypes.FETCH_PARTY_RELATIONSHIPS));
  dispatch(showLoading());
  return CustomAxios()
    .get(
      `${ENVIRONMENT.apiUrl + API.PARTY_RELATIONSHIP}?${queryString.stringify(params)}`,
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.FETCH_PARTY_RELATIONSHIPS));
      dispatch(partyActions.storeAllPartyRelationships(response.data));
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
      notification.success({
        message: "Successfully removed the contact",
        duration: 10,
      });
      dispatch(success(reducerTypes.REMOVE_PARTY_RELATIONSHIP));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.REMOVE_PARTY_RELATIONSHIP));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading()));
};

export const deleteParty = (party_guid) => (dispatch) => {
  dispatch(request(reducerTypes.DELETE_PARTY));
  dispatch(showLoading());
  return CustomAxios({ errorToastMessage: Strings.ERROR })
    .delete(`${ENVIRONMENT.apiUrl + API.PARTY}/${party_guid}`, createRequestHeader())
    .then((response) => {
      notification.success({
        message: "Successfully removed the party",
        duration: 10,
      });
      dispatch(success(reducerTypes.DELETE_PARTY));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.DELETE_PARTY));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading()));
};

export const setAddPartyFormState = (addPartyFormState) => (dispatch) => {
  dispatch(partyActions.storeAddPartyFormState(addPartyFormState));
  return addPartyFormState;
};

export const addDocumentToRelationship =
  ({ mineGuid, minePartyApptGuid }, payload) =>
  (dispatch) => {
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
      .catch((err) => {
        dispatch(error(reducerTypes.ADD_DOCUMENT_TO_RELATIONSHIP));
        throw new Error(err);
      })
      .finally(() => dispatch(hideLoading("modal")));
  };

export const createPartyOrgBookEntity = (partyGuid, payload) => (dispatch) => {
  dispatch(request(reducerTypes.PARTY_ORGBOOK_ENTITY));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .post(ENVIRONMENT.apiUrl + API.PARTY_ORGBOOK_ENTITY(partyGuid), payload, createRequestHeader())
    .then((response) => {
      dispatch(hideLoading("modal"));
      notification.success({
        message: "Successfully associated party with OrgBook entity",
        duration: 10,
      });
      dispatch(success(reducerTypes.PARTY_ORGBOOK_ENTITY));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.PARTY_ORGBOOK_ENTITY));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const mergeParties = (payload) => (dispatch) => {
  dispatch(request(reducerTypes.MERGE_PARTIES));
  dispatch(showLoading());
  return CustomAxios()
    .post(ENVIRONMENT.apiUrl + API.MERGE_PARTIES(), payload, createRequestHeader())
    .then((response) => {
      dispatch(hideLoading());
      notification.success({
        message: "Successfully merged.",
        duration: 10,
      });
      dispatch(success(reducerTypes.MERGE_PARTIES));
      dispatch(partyActions.storeLastCreatedParty(response.data));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.MERGE_PARTIES));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading()));
};
