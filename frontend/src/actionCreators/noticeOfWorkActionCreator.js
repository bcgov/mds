import { showLoading, hideLoading } from "react-redux-loading-bar";
import { error, request, success } from "@/actions/genericActions";
import * as API from "@/constants/API";
import { ENVIRONMENT } from "@/constants/environment";
import { createRequestHeader } from "@/utils/RequestHeaders";
import CustomAxios from "@/customAxios";
import * as noticeOfWorkActions from "@/actions/noticeOfWorkActions";
import * as reducerTypes from "@/constants/reducerTypes";

// vFCBC & NROS NoW initial submissions
export const fetchNoticeOfWorkSubmission = (applicationGuid) => (dispatch) => {
  dispatch(request(reducerTypes.GET_NOTICE_OF_WORK_SUBMISSION));
  dispatch(showLoading());
  return CustomAxios()
    .get(
      `${ENVIRONMENT.apiUrl}${API.NOTICE_OF_WORK_SUBMISSION(applicationGuid)}`,
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.GET_NOTICE_OF_WORK_SUBMISSION));
      dispatch(noticeOfWorkActions.storeNoticeOfWorkSubmission(response.data));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GET_NOTICE_OF_WORK_SUBMISSION)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchNoticeOfWorkSubmissions = (params = {}) => (dispatch) => {
  dispatch(request(reducerTypes.GET_NOTICE_OF_WORK_SUBMISSIONS));
  dispatch(showLoading());
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl}${API.NOTICE_OF_WORK_SUBMISSIONS(params)}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_NOTICE_OF_WORK_SUBMISSIONS));
      dispatch(noticeOfWorkActions.storeNoticeOfWorkSubmissions(response.data));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GET_NOTICE_OF_WORK_SUBMISSIONS)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchMineNoticeOfWorkSubmissions = (mineGuid, params = {}) => (dispatch) => {
  dispatch(request(reducerTypes.GET_MINE_NOTICE_OF_WORK_SUBMISSIONS));
  dispatch(showLoading());
  return CustomAxios()
    .get(
      `${ENVIRONMENT.apiUrl}${API.MINE_NOTICE_OF_WORK_SUBMISSIONS(mineGuid, params)}`,
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_NOTICE_OF_WORK_SUBMISSIONS));
      dispatch(noticeOfWorkActions.storeNoticeOfWorkSubmissions(response.data));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GET_MINE_NOTICE_OF_WORK_SUBMISSIONS)))
    .finally(() => dispatch(hideLoading()));
};

export const createNoticeOfWorkApplication = (mine_guid, submissionGuid) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_NOTICE_OF_WORK_APPLICATION));
  dispatch(showLoading());
  return CustomAxios()
    .get(
      `${ENVIRONMENT.apiUrl}${API.NOTICE_OF_WORK_APPLICATION_IMPORT(submissionGuid)}`,
      { mine_guid },
      createRequestHeader()
    )
    .then(() => {
      dispatch(success(reducerTypes.CREATE_NOTICE_OF_WORK_APPLICATION));
    })
    .catch(() => dispatch(error(reducerTypes.CREATE_NOTICE_OF_WORK_APPLICATION)))
    .finally(() => dispatch(hideLoading()));
};
