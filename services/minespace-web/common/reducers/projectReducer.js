import * as actionTypes from "../constants/actionTypes";
import { PROJECTS } from "../constants/reducerTypes";

const initialState = {
  projects: [],
  project: {},
  projectPageData: {},
  projectSummaries: [],
  projectSummary: {},
  projectSummaryPageData: {},
  informationRequirementsTable: [],
  requirements: [],
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
    default:
      return state;
  }
};

const projectReducerObject = {
  [PROJECTS]: projectReducer,
};

export const getProjects = (state) => state[PROJECTS].projects;
export const getProject = (state) => state[PROJECTS].project;
export const getProjectPageData = (state) => state[PROJECTS].projectPageData;
export const getProjectSummaries = (state) => state[PROJECTS].projectSummaries;
export const getProjectSummary = (state) => state[PROJECTS].projectSummary;
export const getProjectSummaryPageData = (state) => state[PROJECTS].projectSummaryPageData;
export const getRequirements = (state) => state[PROJECTS].requirements;
export const getInformationRequirementsTable = (state) =>
  state[PROJECTS].informationRequirementsTable;

export default projectReducerObject;
