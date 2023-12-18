import * as actionTypes from "@mds/common/constants/actionTypes";
import { PROJECTS } from "@mds/common/constants/reducerTypes";
import { RootState } from "../rootState";
import {
  IInformationRequirementsTable,
  IMajorMinesApplication,
  IProject,
  IProjectDecisionPackage,
  IProjectPageData,
  IProjectSummary,
} from "../..";

interface IProjectReducerState {
  projects: IProject[];
  project: IProject;
  projectPageData: IProjectPageData;
  projectSummaries: IProjectSummary[];
  projectSummary: IProjectSummary;
  projectSummaryPageData: any;
  informationRequirementsTable: IInformationRequirementsTable;
  requirements: IInformationRequirementsTable[];
  majorMinesApplication: IMajorMinesApplication;
  projectDecisionPackage: IProjectDecisionPackage;
}
const initialState: IProjectReducerState = {
  projects: [],
  project: {} as IProject,
  projectPageData: {} as IProjectPageData,
  projectSummaries: [],
  projectSummary: {} as IProjectSummary,
  projectSummaryPageData: {},
  informationRequirementsTable: {} as IInformationRequirementsTable,
  requirements: [],
  majorMinesApplication: {} as IMajorMinesApplication,
  projectDecisionPackage: {} as IProjectDecisionPackage,
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
    case actionTypes.STORE_PROJECT_LINKS:
      return {
        ...state,
        project: {
          ...state.project,
          project_links: [...action.payload, ...state.project?.project_links],
        },
      };
    case actionTypes.REMOVE_PROJECT_LINK:
      const newLinks = state.project?.project_links?.filter(
        (link) => link.project_link_guid !== action.payload
      );
      return {
        ...state,
        project: {
          ...state.project,
          project_links: [...newLinks],
        },
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
export const getProjectLinks = (state: RootState) => state[PROJECTS].project?.project_links;

export default projectReducerObject;
