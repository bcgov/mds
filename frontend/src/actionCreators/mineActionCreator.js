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

export const createMineRecord = (payload) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_MINE_RECORD));
  dispatch(showLoading("modal"));
  return axios
    .post(ENVIRONMENT.apiUrl + API.MINE, payload, createRequestHeader())
    .then((response) =>
      payload.mine_tenure_type_code
        ? axios.post(
            ENVIRONMENT.apiUrl + API.MINE_TYPES,
            {
              mine_guid: response.data.mine_guid,
              mine_tenure_type_code: payload.mine_tenure_type_code,
            },
            createRequestHeader()
          )
        : response
    )
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
  if (payload.mine_tenure_type_code) {
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

export const fetchStatusOptions = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_STATUS_OPTIONS));
  dispatch(showLoading("modal"));
  return axios
    .get(ENVIRONMENT.apiUrl + API.MINE_STATUS, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_STATUS_OPTIONS));
      dispatch(mineActions.storeStatusOptions(response.data));
      dispatch(hideLoading("modal"));
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_STATUS_OPTIONS));
      dispatch(hideLoading("modal"));
    });
};

export const fetchRegionOptions = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_REGION_OPTIONS));
  dispatch(showLoading("modal"));
  return axios
    .get(ENVIRONMENT.apiUrl + API.MINE_REGION, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_REGION_OPTIONS));
      dispatch(mineActions.storeRegionOptions(response.data));
      dispatch(hideLoading("modal"));
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_REGION_OPTIONS));
      dispatch(hideLoading("modal"));
    });
};

export const fetchExpectedDocumentStatusOptions = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_EXPECTED_DOCUMENT_STATUS));
  dispatch(showLoading("modal"));
  return axios
    .get(`${ENVIRONMENT.apiUrl + API.EXPECTED_DOCUMENT}/status`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_EXPECTED_DOCUMENT_STATUS));
      dispatch(mineActions.storeDocumentStatusOptions(response.data));
      dispatch(hideLoading("modal"));
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_EXPECTED_DOCUMENT_STATUS));
      dispatch(hideLoading("modal"));
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

export const fetchMineTailingsRequiredDocuments = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_MINE_TSF_REQUIRED_REPORTS));
  dispatch(showLoading("modal"));
  return axios
    .get(ENVIRONMENT.apiUrl + API.MINE_TSF_REQUIRED_DOCUMENTS, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_TSF_REQUIRED_REPORTS));
      dispatch(mineActions.storeMineTSFRequiredDocuments(response.data));
      dispatch(hideLoading("modal"));
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_MINE_TSF_REQUIRED_REPORTS));
      dispatch(hideLoading("modal"));
    });
};

export const fetchMineTenureTypes = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_TENURE_TYPES));
  dispatch(showLoading("modal"));
  return axios
    .get(ENVIRONMENT.apiUrl + API.MINE_TENURE_TYPES, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_TENURE_TYPES));
      dispatch(mineActions.storeTenureTypes(response.data));
      dispatch(hideLoading("modal"));
    })
    .catch(() => {
      notification.error({
        message: String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_TENURE_TYPES));
      dispatch(hideLoading("modal"));
    });
};
