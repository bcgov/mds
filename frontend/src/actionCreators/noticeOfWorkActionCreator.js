import { showLoading, hideLoading } from "react-redux-loading-bar";
import { error, request, success } from "@/actions/genericActions";
import * as API from "@/constants/API";
import { ENVIRONMENT } from "@/constants/environment";
import { createRequestHeader } from "@/utils/RequestHeaders";
import CustomAxios from "@/customAxios";
import * as noticeOfWorkActions from "@/actions/noticeOfWorkActions";
import * as reducerTypes from "@/constants/reducerTypes";

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
