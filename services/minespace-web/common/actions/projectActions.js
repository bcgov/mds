import * as actionTypes from "../constants/actionTypes";

export const storeProjects = (payload) => ({
  type: actionTypes.STORE_PROJECTS,
  payload,
});

export const storeProject = (payload) => ({
  type: actionTypes.STORE_PROJECT,
  payload,
});

export const clearProject = () => ({
  type: actionTypes.CLEAR_PROJECT,
});

export const storeProjectSummaries = (payload) => ({
  type: actionTypes.STORE_PROJECT_SUMMARIES,
  payload,
});

export const storeProjectSummary = (payload) => ({
  type: actionTypes.STORE_PROJECT_SUMMARY,
  payload,
});

export const clearProjectSummary = () => ({
  type: actionTypes.CLEAR_PROJECT_SUMMARY,
});

export const storeInformationRequirementsTable = (payload) => ({
  type: actionTypes.STORE_INFORMATION_REQUIREMENTS_TABLE,
  payload,
});

export const clearInformationRequirementsTable = (payload) => ({
  type: actionTypes.CLEAR_INFORMATION_REQUIREMENTS_TABLE,
  payload,
});

export const storeMajorMinesApplication = (payload) => ({
  type: actionTypes.STORE_MAJOR_MINES_APPLICATION,
  payload,
});

export const clearMajorMinesApplication = (payload) => ({
  type: actionTypes.CLEAR_MAJOR_MINES_APPLICATION,
  payload,
});

export const storeRequirements = (payload) => ({
  type: actionTypes.STORE_REQUIREMENTS,
  payload,
});

export const clearRequirements = () => ({
  type: actionTypes.CLEAR_REQUIREMENTS,
});

export const storeProjectDecisionPackage = (payload) => ({
  type: actionTypes.STORE_PROJECT_DECISION_PACKAGE,
  payload,
});

export const clearProjectDecisionPackage = (payload) => ({
  type: actionTypes.CLEAR_PROJECT_DECISION_PACKAGE,
  payload,
});

export const clearProjectViewAllTable = () => ({
  type: actionTypes.CLEAR_PROJECT_VIEW_ALL_TABLE,
});
