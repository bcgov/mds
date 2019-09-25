import axios from "axios";
import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { request, success, error } from "@/actions/genericActions";
import * as reducerTypes from "@/constants/reducerTypes";
import * as mineActions from "@/actions/mineActions";
import * as String from "@/constants/strings";
import * as API from "@/constants/API";
import { ENVIRONMENT } from "@/constants/environment";
import { createRequestHeader } from "@/utils/RequestHeaders";
import CustomAxios from "@/customAxios";

const submitMineTypeDetails = (type) => ({ data: { mine_type_guid } }) => {
  const create = (codeType) =>
    type[codeType].length > 0
      ? type[codeType].map((code) =>
          axios.post(
            ENVIRONMENT.apiUrl + API.MINE_TYPES_DETAILS,
            {
              mine_type_guid,
              [codeType]: code,
            },
            createRequestHeader()
          )
        )
      : Promise.resolve([]);

  return Promise.all([...create("mine_disturbance_code"), ...create("mine_commodity_code")]);
};

const handleError = (dispatch, reducer) => (err) => {
  notification.error({
    message: err.response ? err.response.data.message : String.ERROR,
    duration: 10,
  });
  dispatch(error(reducer));
  dispatch(hideLoading("modal"));
};

const createMineTypeRequests = (payload, dispatch, reducer) => (response) => {
  const mineId = response.data.mine_guid;
  if (payload.mine_types) {
    const allMineTypes = payload.mine_types.map((type) =>
      type.mine_tenure_type_code.length >= 1
        ? axios
            .post(
              ENVIRONMENT.apiUrl + API.MINE_TYPES,
              {
                mine_guid: mineId,
                mine_tenure_type_code: type.mine_tenure_type_code,
              },
              createRequestHeader()
            )
            .then(submitMineTypeDetails(type))
            .catch(handleError(dispatch, reducer))
        : response
    );
    return Promise.all(allMineTypes);
  }
  return response;
};

export const createMineRecord = (payload) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_MINE_RECORD));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .post(ENVIRONMENT.apiUrl + API.MINE, payload, createRequestHeader())
    .then(createMineTypeRequests(payload, dispatch, reducerTypes.CREATE_MINE_RECORD))
    .then((response) => {
      notification.success({
        message: `Successfully created: ${payload.mine_name}`,
        duration: 10,
      });
      dispatch(success(reducerTypes.CREATE_MINE_RECORD));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.CREATE_MINE_RECORD)))
    .finally(() => dispatch(hideLoading("modal")));
};

export const updateMineRecord = (id, payload, mineName) => (dispatch) => {
  dispatch(request(reducerTypes.UPDATE_MINE_RECORD));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .put(`${ENVIRONMENT.apiUrl + API.MINE}/${id}`, payload, createRequestHeader())
    .then(createMineTypeRequests(payload, dispatch, reducerTypes.UPDATE_MINE_RECORD))
    .then((response) => {
      notification.success({
        message: `Successfully updated: ${mineName}`,
        duration: 10,
      });
      dispatch(success(reducerTypes.UPDATE_MINE_RECORD));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.UPDATE_MINE_RECORD)))
    .finally(() => dispatch(hideLoading("modal")));
};

export const removeMineType = (mineTypeGuid, tenure) => (dispatch) => {
  dispatch(request(reducerTypes.REMOVE_MINE_TYPE));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .delete(`${ENVIRONMENT.apiUrl + API.MINE_TYPES}/${mineTypeGuid}`, createRequestHeader())
    .then(() => {
      notification.success({
        message: `Successfully removed Tenure: ${tenure}`,
        duration: 10,
      });
      dispatch(success(reducerTypes.REMOVE_MINE_TYPE));
    })
    .catch(() => dispatch(error(reducerTypes.REMOVE_MINE_TYPE)))
    .finally(() => dispatch(hideLoading("modal")));
};

export const createTailingsStorageFacility = (mine_guid, payload) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_TSF));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .post(ENVIRONMENT.apiUrl + API.MINE_TSF(mine_guid), payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: "Successfully added the TSF.",
        duration: 10,
      });
      dispatch(success(reducerTypes.CREATE_TSF));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.CREATE_TSF)))
    .finally(() => dispatch(hideLoading("modal")));
};

export const fetchMineRecords = (params) => (dispatch) => {
  const defaultParams = params || String.DEFAULT_DASHBOARD_PARAMS;
  dispatch(request(reducerTypes.GET_MINE_RECORDS));
  dispatch(showLoading());
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.MINE_LIST_QUERY(defaultParams), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_RECORDS));
      dispatch(mineActions.storeMineList(response.data));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GET_MINE_RECORD)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchMineRecordsForMap = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_MINE_RECORDS));
  dispatch(showLoading());
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.MINE_MAP_LIST, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_RECORDS));
      dispatch(mineActions.storeMineList(response.data));
      dispatch(hideLoading());
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GET_MINE_RECORD)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchMineRecordById = (mineNo) => (dispatch) => {
  dispatch(showLoading());
  dispatch(request(reducerTypes.GET_MINE_RECORD));
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl + API.MINE}/${mineNo}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_RECORD));
      dispatch(mineActions.storeMine(response.data, mineNo));
    })
    .catch(() => dispatch(error(reducerTypes.GET_MINE_RECORD)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchMineNameList = (params = {}) => (dispatch) => {
  dispatch(showLoading());
  dispatch(request(reducerTypes.GET_MINE_NAME_LIST));
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.MINE_NAME_LIST(params), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_NAME_LIST));
      dispatch(mineActions.storeMineNameList(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_MINE_NAME_LIST)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchMineBasicInfoList = (mine_guids) => (dispatch) => {
  dispatch(showLoading());
  dispatch(request(reducerTypes.GET_MINE_BASIC_INFO_LIST));
  return CustomAxios()
    .post(ENVIRONMENT.apiUrl + API.MINE_BASIC_INFO_LIST, { mine_guids }, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_BASIC_INFO_LIST));
      dispatch(mineActions.storeMineBasicInfoList(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_MINE_BASIC_INFO_LIST)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchMineDocuments = (mineGuid) => (dispatch) => {
  dispatch(request(reducerTypes.GET_MINE_DOCUMENTS));
  dispatch(showLoading());
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl}${API.MINE_DOCUMENTS(mineGuid)}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_DOCUMENTS));
      dispatch(mineActions.storeMineDocuments(response.data));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GET_MINE_DOCUMENTS)))
    .finally(() => dispatch(hideLoading()));
};

// MineVerifcationStatus
export const fetchMineVerifiedStatuses = (user_id) => (dispatch) => {
  const params = user_id ? { user_id } : null;
  dispatch(request(reducerTypes.GET_MINE_VERIFIED_STATUS));
  dispatch(showLoading());
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl}${API.MINE_VERIFIED_STATUSES(params)}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_VERIFIED_STATUS));
      if (params) {
        dispatch(mineActions.storeCurrentUserMineVerifiedStatuses(response.data));
      }
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GET_MINE_VERIFIED_STATUS)))
    .finally(() => dispatch(hideLoading()));
};

export const setMineVerifiedStatus = (mine_guid, payload) => (dispatch) => {
  dispatch(request(reducerTypes.SET_MINE_VERIFIED_STATUS));
  return CustomAxios()
    .put(
      `${ENVIRONMENT.apiUrl}${API.MINE_VERIFIED_STATUS(mine_guid)}`,
      payload,
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.SET_MINE_VERIFIED_STATUS));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.SET_MINE_VERIFIED_STATUS)));
};

// mine subscription
export const subscribe = (mineGuid, mineName) => (dispatch) => {
  dispatch(request(reducerTypes.SUBSCRIBE));
  dispatch(showLoading());
  return CustomAxios()
    .post(ENVIRONMENT.apiUrl + API.SUBSCRIPTION(mineGuid), {}, createRequestHeader())
    .then(() => {
      notification.success({
        message: `Successfully subscribed ${mineName}`,
        duration: 10,
      });
      dispatch(success(reducerTypes.SUBSCRIBE));
    })
    .catch(() => dispatch(error(reducerTypes.SUBSCRIBE)))
    .finally(() => dispatch(hideLoading()));
};

export const unSubscribe = (mineGuid, mineName) => (dispatch) => {
  dispatch(request(reducerTypes.UNSUBSCRIBE));
  dispatch(showLoading());
  return CustomAxios()
    .delete(ENVIRONMENT.apiUrl + API.SUBSCRIPTION(mineGuid), createRequestHeader())
    .then(() => {
      notification.success({
        message: `Successfully unsubscribed ${mineName}`,
        duration: 10,
      });
      dispatch(success(reducerTypes.UNSUBSCRIBE));
    })
    .catch(() => dispatch(error(reducerTypes.SUBSCRIBE)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchSubscribedMinesByUser = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_SUBSCRIBED_MINES));
  dispatch(showLoading());
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.MINE_SUBSCRIPTION, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_SUBSCRIBED_MINES));
      dispatch(mineActions.storeSubscribedMines(response.data));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GET_SUBSCRIBED_MINES)))
    .finally(() => dispatch(hideLoading()));
};
