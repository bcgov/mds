import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { request, success, error } from "../actions/genericActions";
import * as reducerTypes from "../constants/reducerTypes";
import * as Strings from "../constants/strings";
import * as projectSummaryActions from "../actions/projectSummaryActions";
import * as API from "../constants/API";
import { ENVIRONMENT } from "../constants/environment";
import { createRequestHeader } from "../utils/RequestHeaders";
import CustomAxios from "../customAxios";

export const createProjectSummary = ({ mineGuid }, payload) => (dispatch) => {
  const message = "Successfully created a new project description";
  dispatch(request(reducerTypes.CREATE_MINE_PROJECT_SUMMARY));
  dispatch(showLoading());
  return CustomAxios()
    .post(ENVIRONMENT.apiUrl + API.MINE_PROJECT_SUMMARIES(mineGuid), payload, createRequestHeader())
    .then((response) => {
      notification.success({ message, duration: 10 });
      dispatch(success(reducerTypes.CREATE_MINE_PROJECT_SUMMARY));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.CREATE_MINE_PROJECT_SUMMARY));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading()));
};

export const updateProjectSummary = ({ mineGuid, projectSummaryGuid }, payload) => (dispatch) => {
  dispatch(request(reducerTypes.UPDATE_MINE_PROJECT_SUMMARY));
  dispatch(showLoading());
  return CustomAxios()
    .put(
      ENVIRONMENT.apiUrl + API.PROJECT_SUMMARY(mineGuid, projectSummaryGuid),
      payload,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Successfully updated project description",
        duration: 10,
      });
      dispatch(success(reducerTypes.UPDATE_MINE_PROJECT_SUMMARY));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.UPDATE_MINE_PROJECT_SUMMARY));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading()));
};

export const fetchProjectSummariesByMine = ({ mineGuid }) => (dispatch) => {
  dispatch(request(reducerTypes.GET_PROJECT_SUMMARIES));
  dispatch(showLoading());
  return CustomAxios({ errorToastMessage: Strings.ERROR })
    .get(ENVIRONMENT.apiUrl + API.MINE_PROJECT_SUMMARIES(mineGuid), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_PROJECT_SUMMARIES));
      dispatch(projectSummaryActions.storeProjectSummaries(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_PROJECT_SUMMARIES)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchProjectSummaryById = (mineGuid, projectSummaryGuid) => (dispatch) => {
  dispatch(request(reducerTypes.GET_PROJECT_SUMMARY));
  dispatch(showLoading());
  return CustomAxios({ errorToastMessage: Strings.ERROR })
    .get(
      ENVIRONMENT.apiUrl + API.PROJECT_SUMMARY(mineGuid, projectSummaryGuid),
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.GET_PROJECT_SUMMARY));
      dispatch(projectSummaryActions.storeProjectSummary(response.data));
    })
    .catch((err) => {
      dispatch(error(reducerTypes.GET_PROJECT_SUMMARY));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading()));
};

export const removeDocumentFromProjectSummary = (
  mineGuid,
  projectSummaryGuid,
  mineDocumentGuid
) => (dispatch) => {
  dispatch(showLoading());
  dispatch(request(reducerTypes.REMOVE_DOCUMENT_FROM_PROJECT_SUMMARY));
  return CustomAxios()
    .delete(
      ENVIRONMENT.apiUrl +
        API.PROJECT_SUMMARY_DOCUMENT(mineGuid, projectSummaryGuid, mineDocumentGuid),
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.REMOVE_DOCUMENT_FROM_PROJECT_SUMMARY));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.REMOVE_DOCUMENT_FROM_PROJECT_SUMMARY));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading()));
};

export const fetchProjectSummaries = (payload) => (dispatch) => {
  dispatch(request(reducerTypes.GET_PROJECT_SUMMARIES));
  dispatch(showLoading());
  return CustomAxios({ errorToastMessage: Strings.ERROR })
    .get(ENVIRONMENT.apiUrl + API.PROJECT_SUMMARIES(payload), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_PROJECT_SUMMARIES));
      dispatch(projectSummaryActions.storeProjectSummaries(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_PROJECT_SUMMARIES)))
    .finally(() => dispatch(hideLoading()));
};

export const deleteProjectSummary = (mineGuid, projectSummaryGuid) => (dispatch) => {
  dispatch(request(reducerTypes.DELETE_PROJECT_SUMMARY));
  dispatch(showLoading());
  return CustomAxios()
    .delete(
      `${ENVIRONMENT.apiUrl}${API.PROJECT_SUMMARY(mineGuid, projectSummaryGuid)}`,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Successfully deleted project description.",
        duration: 10,
      });
      dispatch(success(reducerTypes.DELETE_PROJECT_SUMMARY));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.DELETE_PROJECT_SUMMARY));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading()));
};
