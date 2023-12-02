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

export const HOME = {
  route: "/",
  component: LandingPage,
};

export const RETURN_PAGE = {
  route: "/return-page",
  component: ReturnPage,
};

export const MINES = {
  route: "/mines",
  component: MinesPage,
};

export const USERS = {
  route: "/users",
  component: UsersPage,
};

export const ADD_PROJECT_SUMMARY = {
  route: "/mines/:mineGuid/project-description/new/:tab",
  dynamicRoute: (mineGuid, tab = "basic-information") =>
    `/mines/${mineGuid}/project-description/new/${tab}`,
  component: ProjectSummaryPage,
};

export const EDIT_PROJECT_SUMMARY = {
  route: "/projects/:projectGuid/project-description/:projectSummaryGuid/:tab",
  dynamicRoute: (projectGuid, projectSummaryGuid, activeTab = "basic-information") =>
    `/projects/${projectGuid}/project-description/${projectSummaryGuid}/${activeTab}`,
  component: ProjectSummaryPage,
};

export const EDIT_PROJECT = {
  route: "/projects/:projectGuid/:tab",
  dynamicRoute: (projectGuid, activeTab = "overview") => `/projects/${projectGuid}/${activeTab}`,
  component: ProjectPage,
};

export const ADD_INFORMATION_REQUIREMENTS_TABLE = {
  route: "/projects/:projectGuid/information-requirements-table/new",
  dynamicRoute: (projectGuid) => `/projects/${projectGuid}/information-requirements-table/new`,
  component: InformationRequirementsTablePage,
};

export const RESUBMIT_INFORMATION_REQUIREMENTS_TABLE = {
  route: "/projects/:projectGuid/information-requirements-table/:irtGuid/resubmit",
  dynamicRoute: (projectGuid, irtGuid) =>
    `/projects/${projectGuid}/information-requirements-table/${irtGuid}/resubmit`,
  component: InformationRequirementsTablePage,
};

export const REVIEW_INFORMATION_REQUIREMENTS_TABLE = {
  route: "/projects/:projectGuid/information-requirements-table/:irtGuid/review/:tab",
  dynamicRoute: (projectGuid, irtGuid, tab = "introduction-and-project-overview") =>
    `/projects/${projectGuid}/information-requirements-table/${irtGuid}/review/${tab}`,
  component: InformationRequirementsTablePage,
};

export const INFORMATION_REQUIREMENTS_TABLE_SUCCESS = {
  route: "/projects/:projectGuid/information-requirements-table/:irtGuid/success",
  dynamicRoute: (projectGuid, irtGuid) =>
    `/projects/${projectGuid}/information-requirements-table/${irtGuid}/success`,
  component: InformationRequirementsTableSuccessPage,
};

export const EDIT_MAJOR_MINE_APPLICATION = {
  route: "/projects/:projectGuid/major-mine-application/:mmaGuid/edit",
  dynamicRoute: (projectGuid, mmaGuid) =>
    `/projects/${projectGuid}/major-mine-application/${mmaGuid}/edit`,
  component: MajorMineApplicationPage,
};

export const REVIEW_MAJOR_MINE_APPLICATION = {
  route: "/projects/:projectGuid/major-mine-application/:mmaGuid/review",
  dynamicRoute: (projectGuid, mmaGuid) =>
    `/projects/${projectGuid}/major-mine-application/${mmaGuid}/review`,
  component: MajorMineApplicationPage,
};

export const MAJOR_MINE_APPLICATION_SUCCESS = {
  route: "/projects/:projectGuid/major-mine-application/:mmaGuid/success",
  dynamicRoute: (projectGuid, mmaGuid) =>
    `/projects/${projectGuid}/major-mine-application/${mmaGuid}/success`,
  component: MajorMineApplicationSuccessPage,
};

export const ADD_MAJOR_MINE_APPLICATION = {
  route: "/projects/:projectGuid/major-mine-application/new",
  dynamicRoute: (projectGuid) => `/projects/${projectGuid}/major-mine-application/new`,
  component: MajorMineApplicationPage,
};

export const ADD_MINE_INCIDENT = {
  route: "/mines/:mineGuid/incidents/new",
  dynamicRoute: (mineGuid) => `/mines/${mineGuid}/incidents/new`,
  component: IncidentPage,
};

export const EDIT_MINE_INCIDENT = {
  route: "/mines/:mineGuid/incidents/:mineIncidentGuid",
  dynamicRoute: (mineGuid, mineIncidentGuid) => `/mines/${mineGuid}/incidents/${mineIncidentGuid}`,
  component: IncidentPage,
};

export const REVIEW_MINE_INCIDENT = {
  route: "/mines/:mineGuid/incidents/:mineIncidentGuid/review",
  dynamicRoute: (mineGuid, mineIncidentGuid) =>
    `/mines/${mineGuid}/incidents/${mineIncidentGuid}/review`,
  hashRoute: (mineGuid, mineIncidentGuid, link) =>
    `/mines/${mineGuid}/incidents/${mineIncidentGuid}/review/${link}`,
  component: IncidentPage,
};

export const MINE_INCIDENT_SUCCESS = {
  route: "/mines/:mineGuid/incidents/:mineIncidentGuid/success",
  dynamicRoute: (mineGuid, mineIncidentGuid) =>
    `/mines/${mineGuid}/incidents/${mineIncidentGuid}/success`,
  component: IncidentSuccessPage,
};

export const MINE_DASHBOARD = {
  route: "/mines/:id/:activeTab",
  dynamicRoute: (id, activeTab = "overview", filterParams) =>
    `/mines/${id}/${activeTab}?${queryString.stringify(filterParams)}`,
  component: MineDashboard,
};

export const ADD_TAILINGS_STORAGE_FACILITY = {
  route: "/mines/:mineGuid/tailings-storage-facility/new/:tab",
  dynamicRoute: (mineGuid, tab = "basic-information") =>
    `/mines/${mineGuid}/tailings-storage-facility/new/${tab}`,
  component: TailingsSummaryPageWrapper,
};

export const EDIT_TAILINGS_STORAGE_FACILITY = {
  route: "/mines/:mineGuid/tailings-storage-facility/:tailingsStorageFacilityGuid/:tab/:userAction",
  dynamicRoute: (
    tailingsStorageFacilityGuid,
    mineGuid,
    userAction = "view",
    activeTab = "basic-information"
  ) =>
    `/mines/${mineGuid}/tailings-storage-facility/${tailingsStorageFacilityGuid}/${activeTab}/${userAction}`,
  component: TailingsSummaryPageWrapper,
};

export const ADD_DAM = {
  route:
    "/mine/:mineGuid/tailings-storage-facility/:tailingsStorageFacilityGuid/dam/new/:userAction",
  dynamicRoute: (mineGuid, tailingsStorageFacilityGuid, userAction = "view") =>
    `/mine/${mineGuid}/tailings-storage-facility/${tailingsStorageFacilityGuid}/dam/new/${userAction}`,
  component: DamsPage,
};

export const EDIT_DAM = {
  route:
    "/mine/:mineGuid/tailings-storage-facility/:tailingsStorageFacilityGuid/dam/:damGuid/:userAction",
  dynamicRoute: (mineGuid, tailingsStorageFacilityGuid, damGuid, userAction = "view") =>
    `/mine/${mineGuid}/tailings-storage-facility/${tailingsStorageFacilityGuid}/dam/${damGuid}/${userAction}`,
  component: DamsPage,
};

export const VIEW_ESUP = {
  route: "/mine/:mineGuid/explosives-permits/:explosivesPermitGuid",
  dynamicRoute: (mineGuid, explosivesPermitGuid) =>
    `/mine/${mineGuid}/explosives-permits/${explosivesPermitGuid}`,
  component: ExplosivesPermit,
};
