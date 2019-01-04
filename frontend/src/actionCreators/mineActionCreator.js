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

const submitDisturbances = (type) => ({ data }) => {
  const disturbanceResponses = type.mine_disturbance_code.map((code) =>
    axios.post(
      ENVIRONMENT.apiUrl + API.MINE_TYPES_DETAILS,
      {
        mine_type_guid: data.mine_type_guid,
        mine_disturbance_code: code,
      },
      createRequestHeader()
    )
  );
  const commodityResponses = type.mine_commodity_code.map((code) =>
    axios.post(
      ENVIRONMENT.apiUrl + API.MINE_TYPES_DETAILS,
      {
        mine_type_guid: data.mine_type_guid,
        mine_commodity_code: code,
      },
      createRequestHeader()
    )
  );
  return Promise.all([disturbanceResponses, commodityResponses]);
};

const handleError = (dispatch, reducer) => (err) => {
  notification.error({
    message: err.response ? err.response.data.error.message : String.ERROR,
    duration: 10,
  });
  dispatch(error(reducer));
  dispatch(hideLoading("modal"));
};

const createMineTypeRequests = (payload, dispatch, reducer) => (response) => {
  if (payload.mine_types) {
    const allMineTypes = payload.mine_types.map((type) =>
      type.mine_tenure_type_code
        ? axios
            .post(
              ENVIRONMENT.apiUrl + API.MINE_TYPES,
              {
                mine_guid: response.data.mine_guid,
                mine_tenure_type_code: type.mine_tenure_type_code,
              },
              createRequestHeader()
            )
            .then(submitDisturbances(type))
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
  return axios
    .post(ENVIRONMENT.apiUrl + API.MINE, payload, createRequestHeader())
    .then(createMineTypeRequests(payload, dispatch, reducerTypes.CREATE_MINE_RECORD))
    .then((response) => {
      notification.success({
        message: `Successfully created: ${payload.name}`,
        duration: 10,
      });
      dispatch(success(reducerTypes.CREATE_MINE_RECORD));
      dispatch(hideLoading("modal"));
      return response;
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.CREATE_MINE_RECORD));
      dispatch(hideLoading("modal"));
    });
};

export const updateMineRecord = (id, payload, mineName) => (dispatch) => {
  dispatch(request(reducerTypes.UPDATE_MINE_RECORD));
  dispatch(showLoading("modal"));
  const requests = [
    axios.put(`${ENVIRONMENT.apiUrl + API.MINE}/${id}`, payload, createRequestHeader()),
  ];
  if (payload.mine_types) {
    const mineTypeGuid = payload.mineType[0] ? `/${payload.mineType[0].mine_type_guid}` : "";
    const mineTypesUrl = ENVIRONMENT.apiUrl + API.MINE_TYPES + mineTypeGuid;
    const req = mineTypeGuid ? axios.put : axios.post;
    requests.push(
      req(
        mineTypesUrl,
        { mine_guid: id, mine_tenure_type_code: payload.mine_tenure_type_code },
        createRequestHeader()
      )
    );
  }
  return Promise.all(requests)
    .then((response) => {
      notification.success({
        message: `Successfully updated: ${mineName}`,
        duration: 10,
      });
      dispatch(success(reducerTypes.UPDATE_MINE_RECORD));
      dispatch(hideLoading("modal"));
      return response;
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.UPDATE_MINE_RECORD));
      dispatch(hideLoading("modal"));
    });
};

export const createTailingsStorageFacility = (payload) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_TSF));
  dispatch(showLoading("modal"));
  return axios
    .post(ENVIRONMENT.apiUrl + API.MINE_TSF, payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: "Successfully added the TSF.",
        duration: 10,
      });
      dispatch(success(reducerTypes.CREATE_TSF));
      dispatch(hideLoading("modal"));
      return response;
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.CREATE_TSF));
      dispatch(hideLoading("modal"));
    });
};

export const createMineExpectedDocument = (id, payload) => (dispatch) => {
  dispatch(request(reducerTypes.ADD_MINE_EXPECTED_DOCUMENT));
  dispatch(showLoading());
  return axios
    .post(
      `${ENVIRONMENT.apiUrl + API.ADD_MINE_EXPECTED_DOCUMENT}/${id}`,
      { documents: [payload] },
      createRequestHeader()
    )
    .then((response) => {
      notification.success({ message: "Successfully added the report", duration: 10 });
      dispatch(success(reducerTypes.ADD_MINE_EXPECTED_DOCUMENT));
      dispatch(hideLoading());
      return response;
    })
    .catch(() => {
      notification.error({ message: String.ERROR, duration: 10 });
      dispatch(error(reducerTypes.ADD_MINE_EXPECTED_DOCUMENT));
      dispatch(hideLoading());
    });
};

export const removeExpectedDocument = (exp_doc_guid) => (dispatch) => {
  dispatch(request(reducerTypes.REMOVE_EXPECTED_DOCUMENT));
  dispatch(showLoading());
  return axios
    .delete(
      `${ENVIRONMENT.apiUrl + API.REMOVE_EXPECTED_DOCUMENT}/${exp_doc_guid}`,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({ message: "Successfully removed the report", duration: 10 });
      dispatch(success(reducerTypes.REMOVE_EXPECTED_DOCUMENT));
      dispatch(hideLoading());
      return response;
    })
    .catch(() => {
      notification.error({ message: String.ERROR, duration: 10 });
      dispatch(error(reducerTypes.REMOVE_EXPECTED_DOCUMENT));
      dispatch(hideLoading());
    });
};

export const fetchMineRecords = (params) => (dispatch) => {
  const defaultParams = params || String.DEFAULT_DASHBOARD_PARAMS;
  dispatch(request(reducerTypes.GET_MINE_RECORDS));
  dispatch(showLoading());
  return axios
    .get(ENVIRONMENT.apiUrl + API.MINE_LIST_QUERY(defaultParams), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_RECORDS));
      dispatch(mineActions.storeMineList(response.data));
      dispatch(hideLoading());
      return response;
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_MINE_RECORD));
      dispatch(hideLoading());
    });
};

export const fetchMineRecordById = (mineNo) => (dispatch) => {
  dispatch(showLoading());
  dispatch(request(reducerTypes.GET_MINE_RECORD));
  return axios
    .get(`${ENVIRONMENT.apiUrl + API.MINE}/${mineNo}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_RECORD));
      dispatch(mineActions.storeMine(response.data, mineNo));
      dispatch(hideLoading());
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_MINE_RECORD));
      dispatch(hideLoading());
    });
};

export const fetchMineNameList = (search = null) => (dispatch) => {
  dispatch(showLoading());
  dispatch(request(reducerTypes.GET_MINE_NAME_LIST));
  return axios
    .get(ENVIRONMENT.apiUrl + API.MINE_NAME_LIST(search), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_NAME_LIST));
      dispatch(mineActions.storeMineNameList(response.data));
      dispatch(hideLoading());
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_MINE_NAME_LIST));
      dispatch(hideLoading());
    });
};

export const updateExpectedDocument = (id, payload) => (dispatch) => {
  dispatch(request(reducerTypes.UPDATE_EXPECTED_DOCUMENT));
  dispatch(showLoading("modal"));
  return axios
    .put(`${ENVIRONMENT.apiUrl + API.EXPECTED_DOCUMENT}/${id}`, payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: "Successfully updated expected document",
        duration: 10,
      });
      dispatch(success(reducerTypes.UPDATE_EXPECTED_DOCUMENT));
      dispatch(hideLoading("modal"));
      return response;
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.UPDATE_EXPECTED_DOCUMENT));
      dispatch(hideLoading("modal"));
    });
};

export const fetchMineBasicInfoList = (mine_guids) => (dispatch) => {
  dispatch(showLoading());
  dispatch(request(reducerTypes.GET_MINE_BASIC_INFO_LIST));
  return axios
    .post(
      ENVIRONMENT.apiUrl + API.MINE_BASIC_INFO_LIST,
      { mine_guids: mine_guids },
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_BASIC_INFO_LIST));
      dispatch(mineActions.storeMineBasicInfoList(response.data));
      dispatch(hideLoading());
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_MINE_BASIC_INFO_LIST));
      dispatch(hideLoading());
    });
};
