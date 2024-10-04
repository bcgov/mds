import React from "react";
import queryString from "query-string";
import ExplosivesPermit from "@/components/dashboard/mine/permits/ExplosivesPermit";
const DamsPage = React.lazy(() => import("@common/components/tailings/dam/DamsPage"));
const InformationRequirementsTablePage = React.lazy(() =>
  import("@/components/pages/Project/InformationRequirementsTablePage")
);
const InformationRequirementsTableSuccessPage = React.lazy(() =>
  import("@/components/pages/Project/InformationRequirementsTableSuccessPage")
);
const LandingPage = React.lazy(() => import("@/components/pages/LandingPage"));
const MajorMineApplicationPage = React.lazy(() =>
  import("@/components/pages/Project/MajorMineApplicationPage")
);
const MajorMineApplicationSuccessPage = React.lazy(() =>
  import("@/components/pages/Project/MajorMineApplicationSuccessPage")
);
const MineDashboard = React.lazy(() => import("@/components/dashboard/mine/MineDashboard"));
const MinesPage = React.lazy(() => import("@/components/pages/MinesPage"));
const ProjectPage = React.lazy(() => import("@/components/pages/Project/ProjectPage"));
const ProjectSummaryPage = React.lazy(() =>
  import("@/components/pages/Project/ProjectSummaryPage")
);
const ReturnPage = React.lazy(() => import("@/components/pages/ReturnPage"));
const TailingsSummaryPageWrapper = React.lazy(() =>
  import("@/components/pages/Tailings/TailingsSummaryPageWrapper")
);
const IncidentPage = React.lazy(() => import("@/components/pages/Incidents/IncidentPage"));
const IncidentSuccessPage = React.lazy(() =>
  import("@/components/pages/Incidents/IncidentSuccessPage")
);
const UsersPage = React.lazy(() => import("@/components/pages/UsersPage"));

const ReportPage = React.lazy(() => import("@/components/dashboard/mine/reports/ReportPage"));
const ReportSteps = React.lazy(() => import("@mds/common/components/reports/ReportSteps"));

const ProjectSubmissionStatusPage = React.lazy(() =>
  import("@mds/common/components/projectSummary/ProjectSubmissionStatusPage")
);

export const HOME = {
  route: "/",
  component: LandingPage,
  helpKey: "Home",
};

export const RETURN_PAGE = {
  route: "/return-page",
  component: ReturnPage,
  helpKey: "Home",
};

export const MINES = {
  route: "/mines",
  component: MinesPage,
  helpKey: "Mines",
};

export const USERS = {
  route: "/users",
  component: UsersPage,
  helpKey: "Users", // never implemented
};

export const ADD_PROJECT_SUMMARY = {
  route: "/mines/:mineGuid/project-description/new/:tab",
  dynamicRoute: (mineGuid, tab = "basic-information") =>
    `/mines/${mineGuid}/project-description/new/${tab}`,
  component: ProjectSummaryPage,
  helpKey: "Add-Project-Summary",
};

export const EDIT_PROJECT_SUMMARY = {
  route: "/projects/:projectGuid/project-description/:projectSummaryGuid/:tab",
  dynamicRoute: (projectGuid, projectSummaryGuid, activeTab = "basic-information") =>
    `/projects/${projectGuid}/project-description/${projectSummaryGuid}/${activeTab}`,
  component: ProjectSummaryPage,
  helpKey: "Edit-Project-Summary",
};

export const VIEW_PROJECT_SUBMISSION_STATUS_PAGE = {
  route: "/projects/:projectGuid/project-submission-status/:status",
  dynamicRoute: (projectGuid, status) =>
    `/projects/${projectGuid}/project-submission-status/${status}`,
  component: ProjectSubmissionStatusPage,
  helpKey: "Project-Summary-Submission",
};

export const EDIT_PROJECT = {
  route: "/projects/:projectGuid/:tab",
  dynamicRoute: (projectGuid, activeTab = "overview") => `/projects/${projectGuid}/${activeTab}`,
  hashRoute: (projectGuid, activeTab = "overview", link) =>
    `/projects/${projectGuid}/${activeTab}/${link}`,
  component: ProjectPage,
  helpKey: "Edit-Project",
};

export const ADD_INFORMATION_REQUIREMENTS_TABLE = {
  route: "/projects/:projectGuid/information-requirements-table/new",
  dynamicRoute: (projectGuid) => `/projects/${projectGuid}/information-requirements-table/new`,
  component: InformationRequirementsTablePage,
  helpKey: "Add-IRT",
};

export const RESUBMIT_INFORMATION_REQUIREMENTS_TABLE = {
  route: "/projects/:projectGuid/information-requirements-table/:irtGuid/resubmit",
  dynamicRoute: (projectGuid, irtGuid) =>
    `/projects/${projectGuid}/information-requirements-table/${irtGuid}/resubmit`,
  component: InformationRequirementsTablePage,
  helpKey: "Resubmit-IRT",
};

export const REVIEW_INFORMATION_REQUIREMENTS_TABLE = {
  route: "/projects/:projectGuid/information-requirements-table/:irtGuid/review/:tab",
  dynamicRoute: (projectGuid, irtGuid, tab = "introduction-and-project-overview") =>
    `/projects/${projectGuid}/information-requirements-table/${irtGuid}/review/${tab}`,
  component: InformationRequirementsTablePage,
  helpKey: "Review-IRT",
};

export const INFORMATION_REQUIREMENTS_TABLE_SUCCESS = {
  route: "/projects/:projectGuid/information-requirements-table/:irtGuid/success",
  dynamicRoute: (projectGuid, irtGuid) =>
    `/projects/${projectGuid}/information-requirements-table/${irtGuid}/success`,
  component: InformationRequirementsTableSuccessPage,
  helpKey: "IRT-Submitted",
};

export const EDIT_MAJOR_MINE_APPLICATION = {
  route: "/projects/:projectGuid/major-mine-application/:mmaGuid/edit",
  dynamicRoute: (projectGuid, mmaGuid) =>
    `/projects/${projectGuid}/major-mine-application/${mmaGuid}/edit`,
  component: MajorMineApplicationPage,
  helpKey: "Edit-Major-Mine-Application",
};

export const REVIEW_MAJOR_MINE_APPLICATION = {
  route: "/projects/:projectGuid/major-mine-application/:mmaGuid/review",
  dynamicRoute: (projectGuid, mmaGuid) =>
    `/projects/${projectGuid}/major-mine-application/${mmaGuid}/review`,
  component: MajorMineApplicationPage,
  helpKey: "Review-Major-Mine-Application",
};

export const MAJOR_MINE_APPLICATION_SUCCESS = {
  route: "/projects/:projectGuid/major-mine-application/:mmaGuid/success",
  dynamicRoute: (projectGuid, mmaGuid) =>
    `/projects/${projectGuid}/major-mine-application/${mmaGuid}/success`,
  component: MajorMineApplicationSuccessPage,
  helpKey: "Major-Mine-Application-Submitted",
};

export const ADD_MAJOR_MINE_APPLICATION = {
  route: "/projects/:projectGuid/major-mine-application/new",
  dynamicRoute: (projectGuid) => `/projects/${projectGuid}/major-mine-application/new`,
  component: MajorMineApplicationPage,
  helpKey: "Add-Major-Mine-Application",
};

export const ADD_MINE_INCIDENT = {
  route: "/mines/:mineGuid/incidents/new",
  dynamicRoute: (mineGuid) => `/mines/${mineGuid}/incidents/new`,
  component: IncidentPage,
  helpKey: "Add-Mine-Incident",
};

export const EDIT_MINE_INCIDENT = {
  route: "/mines/:mineGuid/incidents/:mineIncidentGuid",
  dynamicRoute: (mineGuid, mineIncidentGuid) => `/mines/${mineGuid}/incidents/${mineIncidentGuid}`,
  component: IncidentPage,
  helpKey: "Edit-Mine-Incident",
};

export const REVIEW_MINE_INCIDENT = {
  route: "/mines/:mineGuid/incidents/:mineIncidentGuid/review",
  dynamicRoute: (mineGuid, mineIncidentGuid) =>
    `/mines/${mineGuid}/incidents/${mineIncidentGuid}/review`,
  hashRoute: (mineGuid, mineIncidentGuid, link) =>
    `/mines/${mineGuid}/incidents/${mineIncidentGuid}/review/${link}`,
  component: IncidentPage,
  helpKey: "Review-Mine-Incident",
};

export const MINE_INCIDENT_SUCCESS = {
  route: "/mines/:mineGuid/incidents/:mineIncidentGuid/success",
  dynamicRoute: (mineGuid, mineIncidentGuid) =>
    `/mines/${mineGuid}/incidents/${mineIncidentGuid}/success`,
  component: IncidentSuccessPage,
  helpKey: "Mine-Incident-Submitted",
};

const getQueryString = (filterParams?) => {
  if (!filterParams) return "";
  return `?${queryString.stringify(filterParams)}`;
};

export const MINE_DASHBOARD = {
  route: "/mines/:id/:activeTab",
  dynamicRoute: (id, activeTab = "overview", filterParams?: any) =>
    `/mines/${id}/${activeTab}${getQueryString(filterParams)}`,
  component: MineDashboard,
  helpKey: "Mine-Dashboard",
};

export const ADD_TAILINGS_STORAGE_FACILITY = {
  route: "/mines/:mineGuid/tailings-storage-facility/new/:tab",
  dynamicRoute: (mineGuid, tab = "basic-information") =>
    `/mines/${mineGuid}/tailings-storage-facility/new/${tab}`,
  component: TailingsSummaryPageWrapper,
  helpKey: "Add-Tailings-Storage-Facility",
};

export const EDIT_TAILINGS_STORAGE_FACILITY = {
  route: "/mines/:mineGuid/tailings-storage-facility/:tailingsStorageFacilityGuid/:tab/:userAction",
  dynamicRoute: (
    tailingsStorageFacilityGuid,
    mineGuid,
    activeTab = "basic-information",
    isEditMode = false
  ) =>
    `/mines/${mineGuid}/tailings-storage-facility/${tailingsStorageFacilityGuid}/${activeTab}/${
      isEditMode ? "edit" : "view"
    }`,
  component: TailingsSummaryPageWrapper,
  helpKey: "Edit-Tailings-Storage-Facility",
};

export const ADD_DAM = {
  route:
    "/mine/:mineGuid/tailings-storage-facility/:tailingsStorageFacilityGuid/dam/:parentTSFFormMode/:userAction",
  dynamicRoute: (mineGuid, tailingsStorageFacilityGuid, editMode = "edit", userAction = "newDam") =>
    `/mine/${mineGuid}/tailings-storage-facility/${tailingsStorageFacilityGuid}/dam/${editMode}/${userAction}`,
  component: DamsPage,
  helpKey: "Add-Dam",
};

export const EDIT_DAM = {
  route:
    "/mine/:mineGuid/tailings-storage-facility/:tailingsStorageFacilityGuid/:parentTSFFormMode/:userAction/dam/:damGuid",
  dynamicRoute: (
    mineGuid,
    tailingsStorageFacilityGuid,
    damGuid,
    isEditMode = false,
    canEditDam = false
  ) =>
    `/mine/${mineGuid}/tailings-storage-facility/${tailingsStorageFacilityGuid}/${
      isEditMode ? "edit" : "view"
    }/${canEditDam ? "editDam" : "viewDam"}/dam/${damGuid}`,
  component: DamsPage,
  helpKey: "Edit-Dam",
};

export const VIEW_ESUP = {
  route: "/mine/:mineGuid/explosives-permits/:explosivesPermitGuid",
  dynamicRoute: (mineGuid, explosivesPermitGuid) =>
    `/mine/${mineGuid}/explosives-permits/${explosivesPermitGuid}`,
  component: ExplosivesPermit,
  helpKey: "View-ESUP",
};

export const REPORTS_CREATE_NEW = {
  route: "/mines/:mineGuid/reports/new",
  dynamicRoute: (mineGuid) => `/mines/${mineGuid}/reports/new`,
  component: ReportSteps,
  helpKey: "Add-Report",
};

export const REPORT_VIEW_EDIT = {
  route: "/mines/:mineGuid/reports/:reportGuid",
  dynamicRoute: (mineGuid: string, reportGuid: string) =>
    `/mines/${mineGuid}/reports/${reportGuid}`,
  component: ReportPage,
  helpKey: "Report",
};
