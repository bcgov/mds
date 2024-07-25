import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { ENVIRONMENT } from "@mds/common/constants";
import { request, success, error } from "../actions/genericActions";
import * as reducerTypes from "@mds/common/constants/reducerTypes";
import * as mineActions from "../actions/mineActions";
import * as tsfActions from "../actions/tailingsActions";
import * as String from "@mds/common/constants/strings";
import * as API from "@mds/common/constants/API";
import { createRequestHeader } from "../utils/RequestHeaders";
import CustomAxios from "../customAxios";
import { ITailingsStorageFacility, ICreateTailingsStorageFacility } from "@mds/common/interfaces";
import { AppThunk } from "@mds/common/interfaces/appThunk.type";
import { AxiosResponse } from "axios";

const handleError = (dispatch, reducer) => (err) => {
  notification.error({
    message: err.response ? err.response.data.message : String.ERROR,
    duration: 10,
  });
  dispatch(error(reducer));
  dispatch(hideLoading("modal"));
};

export const createMineRecord = (payload) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_MINE_RECORD));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .post(ENVIRONMENT.apiUrl + API.MINE, payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: `Successfully created: ${payload.mine_name}`,
        duration: 10,
      });
      dispatch(success(reducerTypes.CREATE_MINE_RECORD));
      return response;
    })
    .catch(() => {
      dispatch(error(reducerTypes.CREATE_MINE_RECORD));
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const updateMineRecord = (id, payload, mineName) => (dispatch) => {
  dispatch(request(reducerTypes.UPDATE_MINE_RECORD));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .put(`${ENVIRONMENT.apiUrl + API.MINE}/${id}`, payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: `Successfully updated: ${mineName}`,
        duration: 10,
      });
      dispatch(success(reducerTypes.UPDATE_MINE_RECORD));
      return response;
    })
    .catch(() => {
      dispatch(error(reducerTypes.UPDATE_MINE_RECORD));
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const createMineTypes = (mineGuid, mineTypes) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_MINE_TYPE));
  if (mineTypes === undefined) return Promise.resolve([]);
  const mineTypeResponses = mineTypes.map((mineType) =>
    CustomAxios()
      .post(`${ENVIRONMENT.apiUrl}${API.MINE_TYPES(mineGuid)}`, mineType, createRequestHeader())
      .catch(handleError(dispatch, reducerTypes.CREATE_MINE_TYPE))
  );
  return Promise.all(mineTypeResponses);
};

export const removeMineType = (mineGuid, mineTypeGuid, tenure) => (dispatch) => {
  dispatch(request(reducerTypes.REMOVE_MINE_TYPE));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .delete(
      `${ENVIRONMENT.apiUrl}${API.MINE_TYPES(mineGuid)}/${mineTypeGuid}`,
      createRequestHeader()
    )
    .then(() => {
      notification.success({
        message: `Successfully removed Tenure: ${tenure}`,
        duration: 10,
      });
      dispatch(success(reducerTypes.REMOVE_MINE_TYPE));
    })
    .catch(() => {
      dispatch(error(reducerTypes.REMOVE_MINE_TYPE));
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const createTailingsStorageFacility = (
  mine_guid: string,
  payload: ICreateTailingsStorageFacility
): AppThunk<Promise<AxiosResponse<ITailingsStorageFacility>>> => (
  dispatch
): Promise<AxiosResponse<ITailingsStorageFacility>> => {
  dispatch(request(reducerTypes.CREATE_TSF));
  dispatch(showLoading());
  return CustomAxios()
    .post(ENVIRONMENT.apiUrl + API.MINE_TSFS(mine_guid), payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: "Successfully added a new Tailings Storage Facility.",
        duration: 10,
      });
      dispatch(success(reducerTypes.CREATE_TSF));
      dispatch(tsfActions.storeTsf(response.data));
      return response;
    })
    .catch(() => {
      dispatch(error(reducerTypes.CREATE_TSF));
    })
    .finally(() => dispatch(hideLoading()));
};

export const updateTailingsStorageFacility = (
  mineGuid: string,
  TSFGuid: string,
  payload: Partial<ITailingsStorageFacility>
): AppThunk<Promise<AxiosResponse<ITailingsStorageFacility>>> => (
  dispatch
): Promise<AxiosResponse<ITailingsStorageFacility>> => {
  dispatch(request(reducerTypes.UPDATE_TSF));
  dispatch(showLoading());
  return CustomAxios()
    .put(`${ENVIRONMENT.apiUrl}${API.MINE_TSF(mineGuid, TSFGuid)}`, payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: "Successfully updated Tailing Storage Facility.",
        duration: 10,
      });
      dispatch(success(reducerTypes.UPDATE_TSF));
      dispatch(tsfActions.storeTsf(response.data));
      return response;
    })
    .catch(() => {
      dispatch(error(reducerTypes.UPDATE_TSF));
    })
    .finally(() => dispatch(hideLoading()));
};

export const fetchTailingsStorageFacility = (
  mineGuid: string,
  TSFGuid: string
): AppThunk<Promise<AxiosResponse<ITailingsStorageFacility>>> => (
  dispatch
): Promise<AxiosResponse<ITailingsStorageFacility>> => {
  dispatch(request(reducerTypes.GET_TSF));
  dispatch(showLoading());
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl}${API.MINE_TSF(mineGuid, TSFGuid)}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_TSF));
      dispatch(tsfActions.storeTsf(response.data));
      return response;
    })
    .catch(() => {
      dispatch(error(reducerTypes.GET_TSF));
    })
    .finally(() => dispatch(hideLoading()));
};

export const fetchMineRecords = (params = String.DEFAULT_DASHBOARD_PARAMS) => (dispatch) => {
  dispatch(request(reducerTypes.GET_MINE_RECORDS));
  dispatch(showLoading());
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.MINE_LIST_QUERY(params), createRequestHeader())
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
      dispatch(mineActions.storeMine(response.data));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.GET_MINE_RECORD));
      throw new Error(err);
    })
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

export const fetchMineDocuments = (
  mineGuid,
  filters = {
    is_archived: false,
    project_summary_guid: undefined,
    project_decision_package_guid: undefined,
    project_guid: undefined,
    major_mine_application_guid: undefined,
  }
) => (dispatch) => {
  dispatch(request(reducerTypes.GET_MINE_DOCUMENTS));
  dispatch(showLoading());
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl}${API.MINE_DOCUMENTS(mineGuid, filters)}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_DOCUMENTS));
      dispatch(mineActions.storeMineDocuments(response.data));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GET_MINE_DOCUMENTS)))
    .finally(() => dispatch(hideLoading()));
};

export const archiveMineDocuments = (mineGuid: string, mineDocumentGuids: string[]) => (
  dispatch
) => {
  dispatch(request(reducerTypes.ARCHIVE_MINE_DOCUMENTS));
  dispatch(showLoading());
  return CustomAxios()
    .patch(
      `${ENVIRONMENT.apiUrl}${API.ARCHIVE_MINE_DOCUMENTS(mineGuid)}`,
      { mine_document_guids: mineDocumentGuids },
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.ARCHIVE_MINE_DOCUMENTS));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.ARCHIVE_MINE_DOCUMENTS)))
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
    .catch(() => {
      dispatch(error(reducerTypes.SET_MINE_VERIFIED_STATUS));
    });
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

// Comments
export const fetchMineComments = (mineGuid) => (dispatch) => {
  dispatch(request(reducerTypes.GET_MINE_COMMENTS));
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl}${API.MINE_COMMENTS(mineGuid)}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_COMMENTS));
      dispatch(mineActions.storeMineComments(response.data));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GET_MINE_COMMENTS)));
};

export const createMineComment = (mineGuid, payload) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_MINE_COMMENTS));
  return CustomAxios()
    .post(`${ENVIRONMENT.apiUrl}${API.MINE_COMMENTS(mineGuid)}`, payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: "Successfully added comment.",
        duration: 10,
      });
      dispatch(success(reducerTypes.CREATE_MINE_COMMENTS));
      return response;
    })
    .catch(() => {
      dispatch(error(reducerTypes.CREATE_MINE_COMMENTS));
    });
};

export const deleteMineComment = (mineGuid, commentGuid) => (dispatch) => {
  dispatch(request(reducerTypes.DELETE_MINE_COMMENT));
  return CustomAxios()
    .delete(
      `${ENVIRONMENT.apiUrl}${API.MINE_COMMENT(mineGuid, commentGuid)}`,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Successfully deleted comment.",
        duration: 10,
      });
      dispatch(success(reducerTypes.DELETE_MINE_COMMENT));
      return response;
    })
    .catch(() => {
      dispatch(error(reducerTypes.DELETE_MINE_COMMENT));
    });
};
