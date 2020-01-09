import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { error, request, success } from "@/actions/genericActions";
import * as API from "@/constants/API";
import { ENVIRONMENT } from "@/constants/environment";
import { createRequestHeader } from "@/utils/RequestHeaders";
import CustomAxios from "@/customAxios";
import * as noticeOfWorkActions from "@/actions/noticeOfWorkActions";
import * as reducerTypes from "@/constants/reducerTypes";

// vFCBC & NROS NoW initial submissions
export const fetchNoticeOfWorkApplication = (applicationGuid) => (dispatch) => {
  dispatch(request(reducerTypes.GET_NOTICE_OF_WORK_APPLICATION));
  dispatch(showLoading());
  return CustomAxios()
    .get(
      `${ENVIRONMENT.apiUrl}${API.NOTICE_OF_WORK_APPLICATION(applicationGuid)}`,
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.GET_NOTICE_OF_WORK_APPLICATION));
      dispatch(noticeOfWorkActions.storeNoticeOfWorkApplication(response.data));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GET_NOTICE_OF_WORK_APPLICATION)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchNoticeOfWorkApplications = (params = {}) => (dispatch) => {
  dispatch(request(reducerTypes.GET_NOTICE_OF_WORK_APPLICATIONS));
  dispatch(showLoading());
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl}${API.NOTICE_OF_WORK_APPLICATIONS(params)}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_NOTICE_OF_WORK_APPLICATIONS));
      dispatch(noticeOfWorkActions.storeNoticeOfWorkApplications(response.data));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GET_NOTICE_OF_WORK_APPLICATIONS)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchMineNoticeOfWorkApplications = (mineGuid, params = {}) => (dispatch) => {
  dispatch(request(reducerTypes.GET_MINE_NOTICE_OF_WORK_APPLICATIONS));
  dispatch(showLoading());
  return CustomAxios()
    .get(
      `${ENVIRONMENT.apiUrl}${API.MINE_NOTICE_OF_WORK_APPLICATIONS(mineGuid, params)}`,
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_NOTICE_OF_WORK_APPLICATIONS));
      dispatch(noticeOfWorkActions.storeNoticeOfWorkApplications(response.data));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GET_MINE_NOTICE_OF_WORK_APPLICATIONS)))
    .finally(() => dispatch(hideLoading()));
};

export const createNoticeOfWorkApplication = (mine_guid, applicationGuid) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_NOTICE_OF_WORK_APPLICATION));
  dispatch(showLoading());
  return CustomAxios()
    .post(
      `${ENVIRONMENT.apiUrl}${API.NOTICE_OF_WORK_APPLICATION_IMPORT(applicationGuid)}`,
      { mine_guid },
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.CREATE_NOTICE_OF_WORK_APPLICATION));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.CREATE_NOTICE_OF_WORK_APPLICATION)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchImportedNoticeOfWorkApplication = (applicationGuid) => (dispatch) => {
  dispatch(request(reducerTypes.GET_IMPORTED_NOTICE_OF_WORK_APPLICATION));
  dispatch(showLoading());
  return CustomAxios()
    .get(
      `${ENVIRONMENT.apiUrl}${API.NOTICE_OF_WORK_IMPORTED_APPLICATION(applicationGuid)}`,
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.GET_IMPORTED_NOTICE_OF_WORK_APPLICATION));
      dispatch(noticeOfWorkActions.storeNoticeOfWorkApplication(response.data));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GET_IMPORTED_NOTICE_OF_WORK_APPLICATION)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchOriginalNoticeOfWorkApplication = (applicationGuid) => (dispatch) => {
  dispatch(request(reducerTypes.GET_ORIGINAL_NOTICE_OF_WORK_APPLICATION));
  dispatch(showLoading());
  return CustomAxios()
    .get(
      `${ENVIRONMENT.apiUrl}${API.NOTICE_OF_WORK_IMPORTED_APPLICATION(
        applicationGuid
      )}?original=True`,
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.GET_ORIGINAL_NOTICE_OF_WORK_APPLICATION));
      dispatch(noticeOfWorkActions.storeOriginalNoticeOfWorkApplication(response.data));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GET_ORIGINAL_NOTICE_OF_WORK_APPLICATION)))
    .finally(() => dispatch(hideLoading()));
};

export const updateNoticeOfWorkApplication = (
  payload,
  nowApplicationGuid,
  message = "Successsfully updated Notice of Work"
) => (dispatch) => {
  dispatch(request(reducerTypes.UPDATE_NOTICE_OF_WORK_APPLICATION));
  dispatch(showLoading());
  return CustomAxios()
    .put(
      `${ENVIRONMENT.apiUrl}${API.NOTICE_OF_WORK_APPLICATION_UPDATE(nowApplicationGuid)}`,
      payload,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message,
        duration: 10,
      });
      dispatch(success(reducerTypes.UPDATE_NOTICE_OF_WORK_APPLICATION));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.UPDATE_NOTICE_OF_WORK_APPLICATION)))
    .finally(() => dispatch(hideLoading()));
};

export const createNoticeOfWorkApplicationProgress = (applicationGuid, payload) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_NOTICE_OF_WORK_APPLICATION_PROGRESS));
  dispatch(showLoading());
  return CustomAxios()
    .post(
      `${ENVIRONMENT.apiUrl}${API.NOTICE_OF_WORK_APPLICATION_PROGRESS(applicationGuid)}`,
      payload,
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.CREATE_NOTICE_OF_WORK_APPLICATION_PROGRESS));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.CREATE_NOTICE_OF_WORK_APPLICATION_PROGRESS)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchNoticeOfWorkApplicationReviews = (applicationGuid) => (dispatch) => {
  dispatch(request(reducerTypes.GET_NOTICE_OF_WORK_APPLICATION_REVIEW));
  dispatch(showLoading());
  return CustomAxios()
    .get(
      `${ENVIRONMENT.apiUrl}${API.NOTICE_OF_WORK_APPLICATION_REVIEW(applicationGuid)}`,
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.GET_NOTICE_OF_WORK_APPLICATION_REVIEW));
      dispatch(noticeOfWorkActions.storeNoticeOfWorkApplicationReviews(response.data));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GET_NOTICE_OF_WORK_APPLICATION_REVIEW)))
    .finally(() => dispatch(hideLoading()));
};

export const createNoticeOfWorkApplicationReview = (applicationGuid, payload) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_NOTICE_OF_WORK_APPLICATION_REVIEW));
  dispatch(showLoading());
  return CustomAxios()
    .post(
      `${ENVIRONMENT.apiUrl}${API.NOTICE_OF_WORK_APPLICATION_REVIEW(applicationGuid)}`,
      payload,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Successfully added Review",
        duration: 10,
      });
      dispatch(success(reducerTypes.CREATE_NOTICE_OF_WORK_APPLICATION_REVIEW));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.CREATE_NOTICE_OF_WORK_APPLICATION_REVIEW)))
    .finally(() => dispatch(hideLoading()));
};

export const updateNoticeOfWorkApplicationReview = (
  applicationGuid,
  applicationReviewId,
  payload
) => (dispatch) => {
  dispatch(request(reducerTypes.UPDATE_NOTICE_OF_WORK_APPLICATION_REVIEW));
  dispatch(showLoading());
  return CustomAxios()
    .put(
      `${ENVIRONMENT.apiUrl}${API.NOTICE_OF_WORK_APPLICATION_REVIEW(
        applicationGuid
      )}/${applicationReviewId}`,
      payload,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Successfully updated Review",
        duration: 10,
      });
      dispatch(success(reducerTypes.UPDATE_NOTICE_OF_WORK_APPLICATION_REVIEW));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.UPDATE_NOTICE_OF_WORK_APPLICATION_REVIEW)))
    .finally(() => dispatch(hideLoading()));
};

export const deleteNoticeOfWorkApplicationReview = (applicationGuid, applicationReviewId) => (
  dispatch
) => {
  dispatch(request(reducerTypes.REMOVE_NOTICE_OF_WORK_APPLICATION_REVIEW));
  dispatch(showLoading());
  return CustomAxios()
    .delete(
      `${ENVIRONMENT.apiUrl +
        API.NOTICE_OF_WORK_APPLICATION_REVIEW(applicationGuid)}/${applicationReviewId}`,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({ message: "Successfully removed the review", duration: 10 });
      dispatch(success(reducerTypes.REMOVE_NOTICE_OF_WORK_APPLICATION_REVIEW));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.REMOVE_NOTICE_OF_WORK_APPLICATION_REVIEW)))
    .finally(() => dispatch(hideLoading()));
};
