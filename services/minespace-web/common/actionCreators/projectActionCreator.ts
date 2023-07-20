import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { ENVIRONMENT } from "@mds/common";
import { request, success, error } from "../actions/genericActions";
import * as reducerTypes from "../constants/reducerTypes";
import * as Strings from "../constants/strings";
import * as projectActions from "../actions/projectActions";
import * as API from "../constants/API";
import { createRequestHeader } from "../utils/RequestHeaders";
import CustomAxios from "../customAxios";
import {
  ICreateProjectSummary,
  IProjectSummary,
  IProject,
  IInformationRequirementsTable,
  IFileInfo,
  ICreateMajorMinesApplication,
  IMajorMinesApplication,
  IProjectDecisionPackage,
  IProjectPageData,
} from "@mds/common";
import { AppThunk } from "@/store/appThunk.type";
import { AxiosResponse } from "axios";

export const createProjectSummary = (
  { mineGuid },
  payload: Partial<ICreateProjectSummary>,
  message = "Successfully created a new project description"
): AppThunk<Promise<AxiosResponse<IProjectSummary>>> => (
  dispatch
): Promise<AxiosResponse<IProjectSummary>> => {
  dispatch(request(reducerTypes.CREATE_MINE_PROJECT_SUMMARY));
  dispatch(showLoading());
  return CustomAxios()
    .post(
      ENVIRONMENT.apiUrl + API.NEW_PROJECT_SUMMARY(),
      { ...payload, mine_guid: mineGuid },
      createRequestHeader()
    )
    .then((response: AxiosResponse<IProjectSummary>) => {
      notification.success({ message, duration: 10 });
      dispatch(success(reducerTypes.CREATE_MINE_PROJECT_SUMMARY));
      dispatch(projectActions.storeProjectSummary(payload));
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
  payload: IProjectSummary,
  message = "Successfully updated project description"
): AppThunk<Promise<AxiosResponse<IProjectSummary>>> => (
  dispatch
): Promise<AxiosResponse<IProjectSummary>> => {
  dispatch(request(reducerTypes.UPDATE_MINE_PROJECT_SUMMARY));
  dispatch(showLoading());
  return CustomAxios()
    .put(
      ENVIRONMENT.apiUrl + API.PROJECT_SUMMARY(projectGuid, projectSummaryGuid),
      payload,
      createRequestHeader()
    )
    .then((response: AxiosResponse<IProjectSummary>) => {
      notification.success({
        message,
        duration: 10,
      });
      dispatch(success(reducerTypes.UPDATE_MINE_PROJECT_SUMMARY));
      dispatch(projectActions.storeProjectSummary(payload));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.UPDATE_MINE_PROJECT_SUMMARY));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading()));
};

export const updateProject = (
  { projectGuid },
  payload: Partial<IProjectSummary>,
  message = "Successfully updated project.",
  showSuccessMessage = true
): AppThunk<Promise<AxiosResponse<IProject>>> => (dispatch): Promise<AxiosResponse<IProject>> => {
  dispatch(request(reducerTypes.UPDATE_PROJECT));
  dispatch(showLoading());
  return CustomAxios()
    .put(ENVIRONMENT.apiUrl + API.PROJECT(projectGuid), payload, createRequestHeader())
    .then((response: AxiosResponse<IProject>) => {
      if (showSuccessMessage) {
        notification.success({
          message,
          duration: 10,
        });
      }
      dispatch(success(reducerTypes.UPDATE_PROJECT));
      dispatch(projectActions.storeProject(payload));
      return response.data;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.UPDATE_PROJECT));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading()));
};

export const fetchProjectSummariesByMine = ({ mineGuid }): AppThunk => (dispatch) => {
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

export const fetchProjectSummaryById = (
  projectGuid: string,
  projectSummaryGuid: string
): AppThunk => (dispatch) => {
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
  projectGuid: string,
  projectSummaryGuid: string,
  mineDocumentGuid: string
): AppThunk<Promise<AxiosResponse<string>>> => (dispatch): Promise<AxiosResponse<string>> => {
  dispatch(showLoading());
  dispatch(request(reducerTypes.REMOVE_DOCUMENT_FROM_PROJECT_SUMMARY));
  return CustomAxios()
    .delete(
      ENVIRONMENT.apiUrl +
        API.PROJECT_SUMMARY_DOCUMENT(projectGuid, projectSummaryGuid, mineDocumentGuid),
      createRequestHeader()
    )
    .then((response: AxiosResponse<string>) => {
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

export const fetchProjectSummaries = (payload: any): AppThunk => (dispatch) => {
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

export const fetchProjectsByMine = ({ mineGuid }): AppThunk => (dispatch) => {
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

export const fetchProjectById = (
  projectGuid: string
): AppThunk<Promise<AxiosResponse<IProject>>> => (dispatch): Promise<AxiosResponse<IProject>> => {
  dispatch(request(reducerTypes.GET_PROJECT));
  dispatch(showLoading());
  return CustomAxios({ errorToastMessage: Strings.ERROR })
    .get(ENVIRONMENT.apiUrl + API.PROJECT(projectGuid), createRequestHeader())
    .then((response: AxiosResponse<IProject>) => {
      dispatch(success(reducerTypes.GET_PROJECT));
      dispatch(projectActions.storeProject(response.data));
      dispatch(success(reducerTypes.GET_PROJECT_SUMMARY));
      dispatch(projectActions.storeProjectSummary(response.data.project_summary));
      dispatch(success(reducerTypes.GET_INFORMATION_REQUIREMENTS_TABLE));
      dispatch(
        projectActions.storeInformationRequirementsTable(
          response.data.information_requirements_table
        )
      );
      dispatch(success(reducerTypes.GET_MAJOR_MINES_APPLICATION));
      dispatch(projectActions.storeMajorMinesApplication(response.data.major_mine_application));
      return response.data;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.GET_PROJECT));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading()));
};

export const fetchProjects = (params: IProjectPageData): AppThunk => (dispatch) => {
  const defaultParams = params || Strings.DEFAULT_DASHBOARD_PARAMS;
  dispatch(request(reducerTypes.GET_PROJECTS));
  dispatch(showLoading());
  return CustomAxios({ errorToastMessage: Strings.ERROR })
    .get(ENVIRONMENT.apiUrl + API.MAJOR_PROJECT_DASHBOARD(defaultParams), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_PROJECTS));
      dispatch(projectActions.storeProjectViewAllTable(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_PROJECTS)))
    .finally(() => dispatch(hideLoading()));
};

export const deleteProjectSummary = (
  mineGuid: string,
  projectSummaryGuid: string
): AppThunk<Promise<AxiosResponse<string>>> => (dispatch): Promise<AxiosResponse<string>> => {
  dispatch(request(reducerTypes.DELETE_PROJECT_SUMMARY));
  dispatch(showLoading());
  return CustomAxios()
    .delete(
      `${ENVIRONMENT.apiUrl}${API.PROJECT_SUMMARY(mineGuid, projectSummaryGuid)}`,
      createRequestHeader()
    )
    .then((response: AxiosResponse<string>) => {
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

export const createInformationRequirementsTable = (
  projectGuid: string,
  file: IFileInfo,
  documentGuid: string
): AppThunk<Promise<AxiosResponse<IInformationRequirementsTable[]>>> => (
  dispatch
): Promise<AxiosResponse<IInformationRequirementsTable[]>> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("document_guid", documentGuid);
  const customContentType = { "Content-Type": "multipart/form-data" };
  dispatch(request(reducerTypes.INFORMATION_REQUIREMENTS_TABLE));
  dispatch(showLoading());
  return CustomAxios({ errorToastMessage: "", suppressErrorNotification: true })
    .post(
      ENVIRONMENT.apiUrl + API.INFORMATION_REQUIREMENTS_TABLES(projectGuid),
      formData,
      createRequestHeader(customContentType)
    )
    .then((response: AxiosResponse<IInformationRequirementsTable[]>) => {
      dispatch(success(reducerTypes.INFORMATION_REQUIREMENTS_TABLE));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.INFORMATION_REQUIREMENTS_TABLE));
      throw err;
    })
    .finally(() => dispatch(hideLoading()));
};

export const updateInformationRequirementsTableByFile = (
  projectGuid: string,
  informationRequirementsTableGuid: string,
  file: IFileInfo,
  documentGuid: string
): AppThunk<Promise<AxiosResponse<IInformationRequirementsTable[]>>> => (
  dispatch
): Promise<AxiosResponse<IInformationRequirementsTable[]>> => {
  const formData = new FormData();
  formData.append("file", file);
  if (documentGuid) {
    formData.append("document_guid", documentGuid);
  }
  const customContentType = { "Content-Type": "multipart/form-data" };
  dispatch(request(reducerTypes.UPDATE_INFORMATION_REQUIREMENTS_TABLE));
  dispatch(showLoading());
  return CustomAxios({ errorToastMessage: "", suppressErrorNotification: true })
    .put(
      ENVIRONMENT.apiUrl +
        API.INFORMATION_REQUIREMENTS_TABLE(projectGuid, informationRequirementsTableGuid),
      formData,
      createRequestHeader(customContentType)
    )
    .then((response: AxiosResponse<IInformationRequirementsTable[]>) => {
      dispatch(success(reducerTypes.UPDATE_INFORMATION_REQUIREMENTS_TABLE));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.UPDATE_INFORMATION_REQUIREMENTS_TABLE));
      throw err;
    })
    .finally(() => dispatch(hideLoading()));
};

export const updateInformationRequirementsTable = (
  { projectGuid, informationRequirementsTableGuid },
  payload: Partial<IInformationRequirementsTable>,
  message = "Successfully updated information requirements table"
): AppThunk<Promise<AxiosResponse<IInformationRequirementsTable>>> => (
  dispatch
): Promise<AxiosResponse<IInformationRequirementsTable>> => {
  dispatch(request(reducerTypes.UPDATE_INFORMATION_REQUIREMENTS_TABLE));
  dispatch(showLoading());
  return CustomAxios()
    .put(
      ENVIRONMENT.apiUrl +
        API.INFORMATION_REQUIREMENTS_TABLE(projectGuid, informationRequirementsTableGuid),
      payload,
      createRequestHeader()
    )
    .then((response: AxiosResponse<IInformationRequirementsTable>) => {
      notification.success({
        message,
        duration: 10,
      });
      dispatch(success(reducerTypes.UPDATE_INFORMATION_REQUIREMENTS_TABLE));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.UPDATE_INFORMATION_REQUIREMENTS_TABLE));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading()));
};

export const fetchRequirements = (): AppThunk => (dispatch) => {
  dispatch(request(reducerTypes.GET_REQUIREMENTS));
  dispatch(showLoading());
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl}${API.REQUIREMENTS}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_REQUIREMENTS));
      dispatch(projectActions.storeRequirements(response.data));
    })
    .catch((err) => {
      dispatch(error(reducerTypes.GET_REQUIREMENTS));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading()));
};

export const removeDocumentFromInformationRequirementsTable = (
  projectGuid: string,
  irtGuid: string,
  mineDocumentGuid: string
): AppThunk<Promise<AxiosResponse<string>>> => (dispatch): Promise<AxiosResponse<string>> => {
  dispatch(showLoading());
  dispatch(request(reducerTypes.REMOVE_DOCUMENT_FROM_INFORMATION_REQUIREMENTS_TABLE));
  return CustomAxios()
    .delete(
      ENVIRONMENT.apiUrl +
        API.INFORMATION_REQUIREMENTS_TABLE_DOCUMENT(projectGuid, irtGuid, mineDocumentGuid),
      createRequestHeader()
    )
    .then((response: AxiosResponse<string>) => {
      notification.success({
        message: "Successfully deleted information requirements table document.",
        duration: 10,
      });
      dispatch(success(reducerTypes.REMOVE_DOCUMENT_FROM_INFORMATION_REQUIREMENTS_TABLE));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.REMOVE_DOCUMENT_FROM_INFORMATION_REQUIREMENTS_TABLE));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading()));
};

export const createMajorMineApplication = (
  { projectGuid },
  payload: ICreateMajorMinesApplication,
  message = "Successfully created a new major mine application"
): AppThunk<Promise<AxiosResponse<IMajorMinesApplication>>> => (
  dispatch
): Promise<AxiosResponse<IMajorMinesApplication>> => {
  dispatch(request(reducerTypes.CREATE_MAJOR_MINES_APPLICATION));
  dispatch(showLoading());
  return CustomAxios()
    .post(
      ENVIRONMENT.apiUrl + API.MAJOR_MINE_APPLICATIONS(projectGuid),
      payload,
      createRequestHeader()
    )
    .then((response: AxiosResponse<IMajorMinesApplication>) => {
      if (message) {
        notification.success({
          message,
          duration: 10,
        });
      }
      dispatch(success(reducerTypes.CREATE_MAJOR_MINES_APPLICATION));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.CREATE_MAJOR_MINES_APPLICATION));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading()));
};

export const updateMajorMineApplication = (
  { projectGuid, majorMineApplicationGuid },
  payload: IMajorMinesApplication,
  message = "Successfully updated major mine application"
): AppThunk<Promise<AxiosResponse<IMajorMinesApplication>>> => (
  dispatch
): Promise<AxiosResponse<IMajorMinesApplication>> => {
  dispatch(request(reducerTypes.UPDATE_MAJOR_MINES_APPLICATION));
  dispatch(showLoading());
  return CustomAxios()
    .put(
      ENVIRONMENT.apiUrl + API.MAJOR_MINE_APPLICATION(projectGuid, majorMineApplicationGuid),
      payload,
      createRequestHeader()
    )
    .then((response: AxiosResponse<IMajorMinesApplication>) => {
      if (message) {
        notification.success({
          message,
          duration: 10,
        });
      }
      dispatch(success(reducerTypes.UPDATE_MAJOR_MINES_APPLICATION));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.UPDATE_MAJOR_MINES_APPLICATION));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading()));
};

export const removeDocumentFromMajorMineApplication = (
  projectGuid: string,
  majorMineApplicationGuid: string,
  mineDocumentGuid: string
): AppThunk<Promise<AxiosResponse<string>>> => (dispatch): Promise<AxiosResponse<string>> => {
  dispatch(showLoading());
  dispatch(request(reducerTypes.REMOVE_DOCUMENT_FROM_MAJOR_MINE_APPLICATION));
  return CustomAxios()
    .delete(
      ENVIRONMENT.apiUrl +
        API.MAJOR_MINE_APPLICATION_DOCUMENT(
          projectGuid,
          majorMineApplicationGuid,
          mineDocumentGuid
        ),
      createRequestHeader()
    )
    .then((response: AxiosResponse<string>) => {
      notification.success({
        message: "Successfully deleted major mine application document.",
        duration: 10,
      });
      dispatch(success(reducerTypes.REMOVE_DOCUMENT_FROM_MAJOR_MINE_APPLICATION));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.REMOVE_DOCUMENT_FROM_MAJOR_MINE_APPLICATION));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading()));
};

export const createProjectDecisionPackage = (
  { projectGuid },
  payload: Partial<IProjectDecisionPackage>,
  message = "Successfully created a new project decision package."
): AppThunk<Promise<AxiosResponse<IProjectDecisionPackage>>> => (
  dispatch
): Promise<AxiosResponse<IProjectDecisionPackage>> => {
  dispatch(request(reducerTypes.CREATE_PROJECT_DECISION_PACKAGE));
  dispatch(showLoading());
  return CustomAxios()
    .post(
      ENVIRONMENT.apiUrl + API.PROJECT_DECISION_PACKAGES(projectGuid),
      payload,
      createRequestHeader()
    )
    .then((response: AxiosResponse<IProjectDecisionPackage>) => {
      notification.success({ message, duration: 10 });
      dispatch(success(reducerTypes.CREATE_PROJECT_DECISION_PACKAGE));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.CREATE_PROJECT_DECISION_PACKAGE));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading()));
};

export const updateProjectDecisionPackage = (
  { projectGuid, projectDecisionPackageGuid },
  payload: Partial<IProjectDecisionPackage>,
  message = "Successfully updated decision package."
): AppThunk<Promise<AxiosResponse<IProjectDecisionPackage>>> => (
  dispatch
): Promise<AxiosResponse<IProjectDecisionPackage>> => {
  dispatch(request(reducerTypes.UPDATE_PROJECT_DECISION_PACKAGE));
  dispatch(showLoading());
  return CustomAxios()
    .put(
      ENVIRONMENT.apiUrl + API.PROJECT_DECISION_PACKAGE(projectGuid, projectDecisionPackageGuid),
      payload,
      createRequestHeader()
    )
    .then((response: AxiosResponse<IProjectDecisionPackage>) => {
      notification.success({ message, duration: 10 });
      dispatch(success(reducerTypes.UPDATE_PROJECT_DECISION_PACKAGE));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.UPDATE_PROJECT_DECISION_PACKAGE));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading()));
};

export const removeDocumentFromProjectDecisionPackage = (
  projectGuid: string,
  projectDecisionPackageGuid: string,
  mineDocumentGuid: string
): AppThunk<Promise<AxiosResponse<string>>> => (dispatch): Promise<AxiosResponse<string>> => {
  dispatch(showLoading());
  dispatch(request(reducerTypes.REMOVE_DOCUMENT_FROM_PROJECT_DECISION_PACKAGE));
  return CustomAxios()
    .delete(
      ENVIRONMENT.apiUrl +
        API.PROJECT_DECISION_PACKAGE_DOCUMENT(
          projectGuid,
          projectDecisionPackageGuid,
          mineDocumentGuid
        ),
      createRequestHeader()
    )
    .then((response: AxiosResponse<string>) => {
      notification.success({
        message: "Successfully deleted decision package document.",
        duration: 10,
      });
      dispatch(success(reducerTypes.REMOVE_DOCUMENT_FROM_PROJECT_DECISION_PACKAGE));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.REMOVE_DOCUMENT_FROM_PROJECT_DECISION_PACKAGE));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading()));
};
