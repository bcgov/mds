import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { request, success, error } from "../actions/genericActions";
import * as reducerTypes from "../constants/reducerTypes";
import * as Strings from "../constants/strings";
import * as projectActions from "../actions/projectActions";
import * as API from "../constants/API";
import { ENVIRONMENT } from "../constants/environment";
import { createRequestHeader } from "../utils/RequestHeaders";
import CustomAxios from "../customAxios";

export const createProjectSummary = (
  { mineGuid },
  payload,
  message = "Successfully created a new project description"
) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_MINE_PROJECT_SUMMARY));
  dispatch(showLoading());
  return CustomAxios()
    .post(
      ENVIRONMENT.apiUrl + API.NEW_PROJECT_SUMMARY(null),
      { ...payload, mine_guid: mineGuid },
      createRequestHeader()
    )
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

export const updateProjectSummary = (
  { projectGuid, projectSummaryGuid },
  payload,
  message = "Successfully updated project description"
) => (dispatch) => {
  dispatch(request(reducerTypes.UPDATE_MINE_PROJECT_SUMMARY));
  dispatch(showLoading());
  return CustomAxios()
    .put(
      ENVIRONMENT.apiUrl + API.PROJECT_SUMMARY(projectGuid, projectSummaryGuid),
      payload,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message,
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
    .get(
      ENVIRONMENT.apiUrl + API.PROJECT_PROJECT_SUMMARIES(null, { mine_guid: mineGuid }),
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.GET_PROJECT_SUMMARIES));
      dispatch(projectActions.storeProjectSummaries(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_PROJECT_SUMMARIES)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchProjectSummaryById = (projectGuid, projectSummaryGuid) => (dispatch) => {
  dispatch(request(reducerTypes.GET_PROJECT_SUMMARY));
  dispatch(showLoading());
  return CustomAxios({ errorToastMessage: Strings.ERROR })
    .get(
      ENVIRONMENT.apiUrl + API.PROJECT_SUMMARY(projectGuid, projectSummaryGuid),
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.GET_PROJECT_SUMMARY));
      dispatch(projectActions.storeProjectSummary(response.data));
    })
    .catch((err) => {
      dispatch(error(reducerTypes.GET_PROJECT_SUMMARY));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading()));
};

export const removeDocumentFromProjectSummary = (
  projectGuid,
  projectSummaryGuid,
  mineDocumentGuid
) => (dispatch) => {
  dispatch(showLoading());
  dispatch(request(reducerTypes.REMOVE_DOCUMENT_FROM_PROJECT_SUMMARY));
  return CustomAxios()
    .delete(
      ENVIRONMENT.apiUrl +
        API.PROJECT_SUMMARY_DOCUMENT(projectGuid, projectSummaryGuid, mineDocumentGuid),
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Successfully deleted project description document.",
        duration: 10,
      });
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
    .get(ENVIRONMENT.apiUrl + API.PROJECT_PROJECT_SUMMARIES(payload), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_PROJECT_SUMMARIES));
      dispatch(projectActions.storeProjectSummaries(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_PROJECT_SUMMARIES)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchProjectsByMine = ({ mineGuid }) => (dispatch) => {
  dispatch(request(reducerTypes.GET_PROJECTS));
  dispatch(showLoading());
  return CustomAxios({ errorToastMessage: Strings.ERROR })
    .get(ENVIRONMENT.apiUrl + API.PROJECTS(mineGuid), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_PROJECTS));
      dispatch(projectActions.storeProjects(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_PROJECTS)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchProjectById = (projectGuid) => (dispatch) => {
  dispatch(request(reducerTypes.GET_PROJECT));
  dispatch(showLoading());
  return CustomAxios({ errorToastMessage: Strings.ERROR })
    .get(ENVIRONMENT.apiUrl + API.PROJECT(projectGuid), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_PROJECT));
      dispatch(projectActions.storeProject(response.data));
      dispatch(success(reducerTypes.GET_PROJECT_SUMMARY));
      dispatch(projectActions.storeProjectSummary(response.data.project_summary));
    })
    .catch((err) => {
      dispatch(error(reducerTypes.GET_PROJECT));
      throw new Error(err);
    })
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

export const importIrtSpreadsheet = (
  projectGuid,
  file,
  message = "Successfully imported final IRT"
) => (dispatch) => {
  const formData = new FormData();
  formData.append("file", file);
  const customContentType = { "Content-Type": "multipart/form-data" };
  dispatch(request(reducerTypes.IMPORT_INFORMATION_REQUIREMENTS_TABLE));
  dispatch(showLoading());
  return CustomAxios()
    .post(
      ENVIRONMENT.apiUrl + API.IMPORT_LOCAL_INFORMATION_REQUIREMENTS_TABLE(projectGuid),
      formData,
      createRequestHeader(customContentType)
    )
    .then((response) => {
      notification.success({ message, duration: 10 });
      dispatch(success(reducerTypes.IMPORT_INFORMATION_REQUIREMENTS_TABLE));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.IMPORT_INFORMATION_REQUIREMENTS_TABLE));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading()));
};
