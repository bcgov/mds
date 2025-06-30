import React from "react";
import queryString from "query-string";
import ExplosivesPermit from "@/components/dashboard/mine/permits/ExplosivesPermit";
const DamsPage = React.lazy(() => import("@mds/common/components/tailings/dam/DamsPage"));
const InformationRequirementsTablePage = React.lazy(
  () => import("@/components/pages/Project/InformationRequirementsTablePage")
);
const InformationRequirementsTableSuccessPage = React.lazy(
  () => import("@/components/pages/Project/InformationRequirementsTableSuccessPage")
);
const LandingPage = React.lazy(() => import("@/components/pages/LandingPage"));
const MajorMineApplicationPage = React.lazy(
  () => import("@/components/pages/Project/MajorMineApplicationPage")
);
const MajorMineApplicationSuccessPage = React.lazy(
  () => import("@/components/pages/Project/MajorMineApplicationSuccessPage")
);
const MineDashboard = React.lazy(() => import("@/components/dashboard/mine/MineDashboard"));
const MinesPage = React.lazy(() => import("@/components/pages/MinesPage"));
const ProjectPage = React.lazy(() => import("@/components/pages/Project/ProjectPage"));
const EnvApplicationPage = React.lazy(
  () => import("@mds/common/components/project/envApplication/EnvApplicationPage")
);
const NoticeOfWorkPage = React.lazy(
  () => import("@/components/pages/NoticeOfWork/NoticeOfWorkPage")
);
const ProjectSummaryPage = React.lazy(
  () => import("@/components/pages/Project/ProjectSummaryPage")
);
const ReturnPage = React.lazy(() => import("@/components/pages/ReturnPage"));
const TailingsSummaryPageWrapper = React.lazy(
  () => import("@/components/pages/Tailings/TailingsSummaryPageWrapper")
);
const TailingsSubmitSuccess = React.lazy(
  () => import("@/components/pages/Tailings/TailingsSubmitSuccess")
);

const IncidentPage = React.lazy(() => import("@/components/pages/Incidents/IncidentPage"));
const IncidentSuccessPage = React.lazy(
  () => import("@/components/pages/Incidents/IncidentSuccessPage")
);
const UsersPage = React.lazy(() => import("@/components/pages/UsersPage"));

const ReportPage = React.lazy(() => import("@/components/dashboard/mine/reports/ReportPage"));
const ReportSteps = React.lazy(() => import("@mds/common/components/reports/ReportSteps"));
const ViewPermit = React.lazy(() => import("@mds/common/components/permits/ViewPermit"));
const ViewPermitRedirect = React.lazy(
  () => import("@/components/dashboard/mine/permits/ViewPermitRedirect")
);

const ProjectStartPage = React.lazy(
  () => import("@/components/dashboard/mine/projects/ProjectStartPage")
);
const ProjectSubmissionStatusPage = React.lazy(
  () => import("@mds/common/components/projectSummary/ProjectSubmissionStatusPage")
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

export const PROJECT_START_PAGE = {
  route: "/mines/:mineGuid/project-start",
  dynamicRoute: (mineGuid) => `/mines/${mineGuid}/project-start`,
  component: ProjectStartPage,
  helpKey: "Project-Start-Page",
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

export const AMS_FINAL_APPLICATION = {
  route:
    "/projects/:projectGuid/project-summary/:projectSummaryGuid/application/:projectSummaryAuthorizationGuid/:tab",
  dynamicRoute: (
    projectGuid,
    projectSummaryGuid,
    projectSummaryAuthorizationGuid,
    tab = "basic-information"
  ) =>
    `/projects/${projectGuid}/project-summary/${projectSummaryGuid}/application/${projectSummaryAuthorizationGuid}/${tab}`,
  component: EnvApplicationPage,
  helpKey: "ENV-Final-Application",
};

export const VIEW_NOTICE_OF_WORK = {
  route: "/notice-of-work/:nowApplicationGuid/:tab",
  dynamicRoute: (nowApplicationGuid, activeTab = "overview") =>
    `/notice-of-work/${nowApplicationGuid}/${activeTab}`,
  hashRoute: (nowApplicationGuid, activeTab = "overview", link) =>
    `/notice-of-work/${nowApplicationGuid}/${activeTab}/${link}`,
  component: NoticeOfWorkPage,
  helpKey: "View-Notice-Of-Work",
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
  hashRoute: (projectGuid, irtGuid, tab = "introduction-and-project-overview") =>
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

export const PROJECT_STAGE_ENTRY = {
  route: "/projects/:projectGuid/:tab/entry",
  dynamicRoute: (projectGuid: string, tab: string) => `/projects/${projectGuid}/${tab}/entry`,
  component: ProjectPage,
  helpKey: "Create-Project-Stage",
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
  route: "/mines/:id/dashboard/:activeTab/:subTab?",
  dynamicRoute: (id, activeTab = "overview", subTab?, filterParams?: any) =>
    `/mines/${id}/dashboard/${activeTab}${subTab ? `/${subTab}` : ""}${getQueryString(filterParams)}`,
  component: MineDashboard,
  helpKey: "Mine-Dashboard",
};

export const MAJOR_PROJECTS = {
  route: MINE_DASHBOARD.route,
  dynamicRoute: (id) => MINE_DASHBOARD.dynamicRoute(id, "applications"),
  component: MINE_DASHBOARD.component,
  helpKey: MINE_DASHBOARD.helpKey,
};

export const MINE_TAILINGS = {
  route: MINE_DASHBOARD.route,
  dynamicRoute: (id, filterParams?: any) =>
    MINE_DASHBOARD.dynamicRoute(id, "tailings", null, filterParams),
  component: MINE_DASHBOARD.component,
  helpKey: MINE_DASHBOARD.helpKey,
};

export const ADD_TAILINGS_STORAGE_FACILITY = {
  route: "/mines/:mineGuid/tailings-storage-facility/new/:tab",
  dynamicRoute: (mineGuid, tab = "basic-information") =>
    `/mines/${mineGuid}/tailings-storage-facility/new/${tab}`,
  component: TailingsSummaryPageWrapper,
  helpKey: "Add-Tailings-Storage-Facility",
};

export const TAILINGS_SUBMIT_SUCCESS = {
  route: "/mines/:mineGuid/tailings-storage-facility/:tailingsStorageFacilityGuid/submit-success",
  dynamicRoute: (mineGuid, tailingsStorageFacilityGuid) =>
    `/mines/${mineGuid}/tailings-storage-facility/${tailingsStorageFacilityGuid}/submit-success`,
  component: TailingsSubmitSuccess,
  helpKey: "Tailings-Submit-Success",
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

export const VIEW_MINE_PERMIT_AMENDMENT = {
  route: "/mines/:id/permits/:permitGuid/permit-amendment/:permitAmendmentGuid/:tab",
  dynamicRoute: (id, permitGuid, permitAmendmentGuid, tab = "overview") =>
    `/mines/${id}/permits/${permitGuid}/permit-amendment/${permitAmendmentGuid}/${tab}`,
  hashRoute: (id, permitGuid, permitAmendmentGuid, tab = "overview", link = "") =>
    `/mines/${id}/permits/${permitGuid}/permit-amendment/${permitAmendmentGuid}/${tab}/${link}`,
  component: ViewPermit,
  helpKey: "View-Permit",
  priority: 1,
};

export const MINE_PERMITS = {
  route: MINE_DASHBOARD.route,
  dynamicRoute: (id) => MINE_DASHBOARD.dynamicRoute(id, "permits"),
};

export const PERMIT_VIEW = {
  route: "/mines/:id/redirect/permits/:permitGuid",
  dynamicRoute: (id: string, permitGuid: string) => `/mines/${id}/redirect/permits/${permitGuid}`,
  component: ViewPermitRedirect,
  helpKey: "Permit",
};
