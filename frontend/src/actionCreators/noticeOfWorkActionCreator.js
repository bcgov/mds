/* eslint-disable */
import { error } from "@/actions/genericActions";
import * as Strings from "@/constants/strings";
import * as API from "@/constants/API";
import { ENVIRONMENT } from "@/constants/environment";
import { createRequestHeader } from "@/utils/RequestHeaders";
import CustomAxios from "@/customAxios";

// This file is anticipated to have multiple exports
// eslint-disable-next-line import/prefer-default-export
export const fetchNoticeOfWorkApplication = (applicationGuid) => (dispatch) => {
  dispatch(request(reducerTypes.GET_MINE_REPORTS));
  dispatch(showLoading());
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl}${API.NOTICE_OF_WORK_APPLICATION()}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_REPORTS));
      dispatch(mineReportActions.storeNoticeOfWorkApplication(response.data));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GET_MINE_REPORTS)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchNoticeOfWorkApplications = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_MINE_REPORTS));
  dispatch(showLoading());
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl}${API.NOTICE_OF_WORK_APPLICATION}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_REPORTS));
      dispatch(mineReportActions.storeNoticeOfWorkApplication(response.data));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GET_MINE_REPORTS)))
    .finally(() => dispatch(hideLoading()));
};
