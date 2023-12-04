import * as actionTypes from "@mds/common/constants/actionTypes";
import { PROJECTS } from "@mds/common/constants/reducerTypes";
import { RootState } from "../rootState";

const initialState = {
  projects: [],
  project: {},
  projectPageData: {},
  projectSummaries: [],
  projectSummary: {},
  projectSummaryPageData: {},
  informationRequirementsTable: {},
  requirements: [],
  majorMinesApplication: {},
  projectDecisionPackage: {},
};

export const projectReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_PROJECTS:
      return {
        ...state,
        projects: action.payload.records,
        projectPageData: action.payload,
      };
    case actionTypes.STORE_PROJECT:
      return {
        ...state,
        project: action.payload,
      };
    case actionTypes.CLEAR_PROJECT:
      return {
        ...state,
        project: {},
      };
    case actionTypes.STORE_PROJECT_SUMMARIES:
      return {
        ...state,
        projectSummaries: action.payload.records,
        projectSummaryPageData: action.payload,
      };
    case actionTypes.STORE_PROJECT_SUMMARY:
      return {
        ...state,
        projectSummary: action.payload,
      };
    case actionTypes.CLEAR_PROJECT_SUMMARY:
      return {
        ...state,
        projectSummary: {},
      };
    case actionTypes.STORE_REQUIREMENTS:
      return {
        ...state,
        requirements: action.payload.records,
      };
    case actionTypes.CLEAR_REQUIREMENTS:
      return {
        ...state,
        requirements: [],
      };
    case actionTypes.STORE_INFORMATION_REQUIREMENTS_TABLE:
      return {
        ...state,
        informationRequirementsTable: action.payload,
      };
    case actionTypes.CLEAR_INFORMATION_REQUIREMENTS_TABLE:
      return {
        ...state,
        informationRequirementsTable: {},
      };
    case actionTypes.STORE_MAJOR_MINES_APPLICATION:
      return {
        ...state,
        majorMinesApplication: action.payload,
      };
    case actionTypes.CLEAR_MAJOR_MINES_APPLICATION:
      return {
        ...state,
        majorMinesApplication: {},
      };
    case actionTypes.STORE_PROJECT_DECISION_PACKAGE:
      return {
        ...state,
        projectDecisionPackage: action.payload,
      };
    case actionTypes.CLEAR_PROJECT_DECISION_PACKAGE:
      return {
        ...state,
        projectDecisionPackage: {},
      };
    case actionTypes.STORE_PROJECT_VIEW_ALL_TABLE:
      return {
        ...state,
        projects: action.payload.records,
        projectPageData: action.payload,
      };
    case actionTypes.CLEAR_PROJECT_VIEW_ALL_TABLE:
      return {
        ...state,
        projects: {},
        projectPageData: {},
      };
    default:
      return state;
  }
};

const projectReducerObject = {
  [PROJECTS]: projectReducer,
};

export const getProjects = (state: RootState) => state[PROJECTS].projects;
export const getProject = (state: RootState) => state[PROJECTS].project;
export const getProjectPageData = (state: RootState) => state[PROJECTS].projectPageData;
export const getProjectSummaries = (state: RootState) => state[PROJECTS].projectSummaries;
export const getProjectSummary = (state: RootState) => state[PROJECTS].projectSummary;
export const getProjectSummaryPageData = (state: RootState) =>
  state[PROJECTS].projectSummaryPageData;
export const getRequirements = (state: RootState) => state[PROJECTS].requirements;
export const getInformationRequirementsTable = (state: RootState) =>
  state[PROJECTS].informationRequirementsTable;
export const getMajorMinesApplication = (state: RootState) => state[PROJECTS].majorMinesApplication;
export const getProjectDecisionPackage = (state: RootState) =>
  state[PROJECTS].projectDecisionPackage;

export default projectReducerObject;
