import queryString from "query-string";
import * as Strings from "@common/constants/strings";
import { isEmpty } from "lodash";
import Home from "@/components/Home";
import Logout from "@/components/common/Logout";
import Dashboard from "@/components/dashboard/minesHomePage/Dashboard";
import ContactHomePage from "@/components/dashboard/contactsHomePage/ContactHomePage";
import VarianceHomePage from "@/components/dashboard/varianceHomePage/VarianceHomePage";
import IncidentsHomePage from "@/components/dashboard/incidentsHomePage/IncidentsHomePage";
import ReportsHomePage from "@/components/dashboard/reportsHomePage/ReportsHomePage";
import MajorProjectHomePage from "@/components/dashboard/majorProjectHomePage/MajorProjectHomePage";
import MineDashboard from "@/components/mine/MineDashboard";
import PartyProfile from "@/components/parties/PartyProfile";
import RelationshipProfile from "@/components/parties/RelationshipProfile";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminPermitConditionManagement from "@/components/admin/permitConditions/AdminPermitConditionManagement";
import AdminVerifiedMinesList from "@/components/admin/AdminVerifiedMinesList";
import MinespaceUserManagement from "@/components/admin/MinespaceUserManagement";
import ReportingDashboard from "@/components/dashboard/reporting/ReportingDashboard";
import ExecutiveReportingDashboard from "@/components/dashboard/reporting/ExecutiveReportingDashboard";
import SearchResults from "@/components/search/SearchResults";
import CustomHomePage from "@/components/dashboard/customHomePage/CustomHomePage";
import MineSummary from "@/components/mine/Summary/MineSummary";
import MineContactInfo from "@/components/mine/ContactInfo/MineContactInfo";
import MinePermitInfo from "@/components/mine/Permit/MinePermitInfo";
import MineSecurityInfo from "@/components/mine/Securities/MineSecurityInfo";
import MineVariance from "@/components/mine/Variances/MineVariance";
import MineNoticeOfDeparture from "@/components/mine/NoticeOfDeparture/MineNoticeOfDeparture";
import MineComplianceInfo from "@/components/mine/Compliance/MineComplianceInfo";
import MineIncidents from "@/components/mine/Incidents/MineIncidents";
import MineTailingsInfo from "@/components/mine/Tailings/MineTailingsInfo";
import MineReportInfo from "@/components/mine/Reports/MineReportInfo";
import MineDocuments from "@/components/mine/Documents/MineDocuments";
import PermitRequiredReports from "@/components/mine/Reports/PermitRequiredReports";
import MineApplications from "@/components/mine/NoticeOfWork/MineApplications";
import MineProject from "@/components/mine/Projects/MineProject";
import ProjectSummary from "@/components/mine/Projects/ProjectSummary";
import ExternalAuthorizations from "@/components/mine/ExternalAuthorizations/ExternalAuthorizations";
import HomePage from "@/components/dashboard/HomePage";
import NoticeOfWorkHomePage from "@/components/dashboard/noticeOfWorkHomePage/NoticeOfWorkHomePage";
import NoticeOfWorkApplication from "@/components/noticeOfWork/applications/NoticeOfWorkApplication";
import AdminAmendmentApplication from "@/components/noticeOfWork/applications/AdminAmendmentApplication";
import ViewNoticeOfWorkApplication from "@/components/noticeOfWork/applications/ViewNoticeOfWorkApplication";
import MergeContactsDashboard from "@/components/admin/contacts/MergeContactsDashboard";
import MineSpaceEMLIContactManagement from "@/components/admin/contacts/EMLIContacts/MineSpaceEMLIContactManagement";
import PermitConditionManagement from "@/components/mine/Permit/PermitConditionManagement";
import Project from "@/components/mine/Projects/Project";
import InformationRequirementsTableTab from "@/components/mine/Projects/InformationRequirementsTableTab";
import ProjectDocumentsTab from "@/components/mine/Projects/ProjectDocumentsTab";
import MajorMineApplicationTab from "@/components/mine/Projects/MajorMineApplicationTab";
import DecisionPackageTab from "@/components/mine/Projects/DecisionPackageTab";
import MineIncident from "@/components/mine/Incidents/MineIncident";

const withoutDefaultParams = (params, defaults) => {
  const newParams = JSON.parse(JSON.stringify(params));
  Object.keys(defaults)
    .filter((param) => param in newParams && newParams[param] === defaults[param])
    .map((param) => delete newParams[param]);
  return newParams;
};

const withoutNullParams = (params) => {
  const newParams = JSON.parse(JSON.stringify(params));
  Object.keys(params)
    .filter((param) => params[param] === null)
    .map((param) => delete newParams[param]);
  return newParams;
};

export const DASHBOARD = {
  route: "/",
  component: Home,
};

export const HOME_PAGE = {
  route: "/home/",
  component: HomePage,
};

export const CUSTOM_HOME_PAGE = {
  route: "/my-dashboard/",
  component: CustomHomePage,
};

export const LOGOUT = {
  route: "/logout-confirmed/",
  component: Logout,
};

const MINE_HOME_PAGE_MAP_DEFAULT_PARAMS = {
  lat: Strings.DEFAULT_LAT,
  long: Strings.DEFAULT_LONG,
  mineName: null,
  zoom: Strings.DEFAULT_ZOOM,
};

export const MINE_HOME_PAGE = {
  route: "/dashboard/mines",
  dynamicRoute: (params = null) =>
    `/dashboard/mines/?${queryString.stringify({ ...params }, { sort: false })}`,
  mapRoute: (params = null) => {
    let newParams = params;
    if (newParams) {
      newParams = withoutDefaultParams(params, MINE_HOME_PAGE_MAP_DEFAULT_PARAMS);
    }
    return `/dashboard/mines?map=true${
      !isEmpty(newParams) ? `&${queryString.stringify({ ...newParams }, { sort: false })}` : ""
    }`;
  },
  component: Dashboard,
};

export const CONTACT_HOME_PAGE = {
  route: "/dashboard/contacts",
  dynamicRoute: ({ page, per_page, ...params }) =>
    `/dashboard/contacts/?${queryString.stringify({ page, per_page, ...params }, { sort: false })}`,
  component: ContactHomePage,
};

// Mine Dashboard Routes
export const MINE_SUMMARY = {
  route: "/mine-dashboard/:id/",
  dynamicRoute: (id) => `/mine-dashboard/${id}/`,
  component: MineDashboard,
};

export const MINE_CONTACTS = {
  route: "/mine-dashboard/:id/mine-information/contacts",
  dynamicRoute: (id) => `/mine-dashboard/${id}/mine-information/contacts`,
  component: MineContactInfo,
};

export const MINE_GENERAL = {
  route: "/mine-dashboard/:id/mine-information/general",
  dynamicRoute: (id) => `/mine-dashboard/${id}/mine-information/general`,
  component: MineSummary,
};

export const MINE_DOCUMENTS = {
  route: "/mine-dashboard/:id/mine-information/mms-archive",
  dynamicRoute: (id) => `/mine-dashboard/${id}/mine-information/mms-archive`,
  component: MineDocuments,
};

export const MINE_PERMITS = {
  route: "/mine-dashboard/:id/permits-and-approvals/permits",
  dynamicRoute: (id) => `/mine-dashboard/${id}/permits-and-approvals/permits`,
  component: MinePermitInfo,
};

export const MINE_SECURITIES = {
  route: "/mine-dashboard/:id/permits-and-approvals/securities",
  dynamicRoute: (id) => `/mine-dashboard/${id}/permits-and-approvals/securities`,
  component: MineSecurityInfo,
};

export const MINE_VARIANCES = {
  route: "/mine-dashboard/:id/permits-and-approvals/variances",
  dynamicRoute: (id) => `/mine-dashboard/${id}/permits-and-approvals/variances`,
  component: MineVariance,
};

export const MINE_NOTICES_OF_DEPARTURE = {
  route: "/mine-dashboard/:id/permits-and-approvals/notices-of-departure",
  dynamicRoute: (id) => `/mine-dashboard/${id}/permits-and-approvals/notices-of-departure`,
  component: MineNoticeOfDeparture,
};

export const NOTICE_OF_DEPARTURE = {
  route: "/mine-dashboard/:id/permits-and-approvals/notices-of-departure",
  dynamicRoute: (id, nodGuid) =>
    `/mine-dashboard/${id}/permits-and-approvals/notices-of-departure?nod=${nodGuid}`,
  component: MineNoticeOfDeparture,
};

// Projects
export const MINE_PRE_APPLICATIONS = {
  route: "/mine-dashboard/:id/permits-and-approvals/pre-applications",
  dynamicRoute: (id) => `/mine-dashboard/${id}/permits-and-approvals/pre-applications`,
  component: MineProject,
};

export const ADD_PROJECT_SUMMARY = {
  route: "/mines/:mineGuid/project-description/new",
  dynamicRoute: (mineGuid) => `/mines/${mineGuid}/project-description/new`,
  component: ProjectSummary,
};

export const PRE_APPLICATIONS = {
  route: "/pre-applications/:projectGuid/project-description/:projectSummaryGuid",
  dynamicRoute: (projectGuid, projectSummaryGuid) =>
    `/pre-applications/${projectGuid}/project-description/${projectSummaryGuid}`,
  hashRoute: (projectGuid, projectSummaryGuid, link) =>
    `/pre-applications/${projectGuid}/project-description/${projectSummaryGuid}/${link}`,
  component: ProjectSummary,
};

export const PROJECTS = {
  route: "/pre-applications/:projectGuid/:tab",
  dynamicRoute: (projectGuid, tab = "overview") => `/pre-applications/${projectGuid}/${tab}`,
  component: Project,
};

export const MAJOR_MINE_APPLICATION = {
  route: "/pre-applications/:projectGuid/major-mine-application/:mmaGuid/:tab",
  dynamicRoute: (projectGuid, mmaGuid, tab = "final-app") =>
    `/pre-applications/${projectGuid}/major-mine-application/${mmaGuid}/${tab}`,
  component: MajorMineApplicationTab,
};

export const PROJECT_FINAL_APPLICATION = {
  route: "/pre-applications/:projectGuid/final-app",
  dynamicRoute: (projectGuid) => `/pre-applications/${projectGuid}/final-app`,
  hashRoute: (projectGuid, link) => `/pre-applications/${projectGuid}/final-app/${link}`,
  component: MajorMineApplicationTab,
};

export const PROJECT_ALL_DOCUMENTS = {
  route: "/pre-applications/:projectGuid/documents",
  dynamicRoute: (projectGuid) => `/pre-applications/${projectGuid}/documents`,
  hashRoute: (projectGuid, link) => `/pre-applications/${projectGuid}/documents/${link}`,
  component: ProjectDocumentsTab,
};

export const PROJECT_DECISION_PACKAGE = {
  route: "/pre-applications/:projectGuid/project-decision-package",
  dynamicRoute: (projectGuid) => `/pre-applications/${projectGuid}/project-decision-package`,
  hashRoute: (projectGuid, link) =>
    `/pre-applications/${projectGuid}/project-decision-package/${link}`,
  component: DecisionPackageTab,
};

export const INFORMATION_REQUIREMENTS_TABLE = {
  route: "/pre-applications/:projectGuid/information-requirements-table/:irtGuid/:tab",
  dynamicRoute: (projectGuid, irtGuid, tab = "intro-project-overview") =>
    `/pre-applications/${projectGuid}/information-requirements-table/${irtGuid}/${tab}`,
  component: InformationRequirementsTableTab,
};

export const MINE_NOW_APPLICATIONS = {
  route: "/mine-dashboard/:id/permits-and-approvals/applications",
  dynamicRoute: (id, params) =>
    `/mine-dashboard/${id}/permits-and-approvals/applications?${queryString.stringify(params)}`,
  component: MineApplications,
};

export const MINE_EXTERNAL_AUTHORIZATIONS = {
  route: "/mine-dashboard/:id/external-authorizations",
  dynamicRoute: (id) => `/mine-dashboard/${id}/external-authorizations`,
  component: ExternalAuthorizations,
};

export const MINE_INCIDENTS = {
  route: "/mine-dashboard/:id/oversight/incidents-and-investigations",
  dynamicRoute: (id) => `/mine-dashboard/${id}/oversight/incidents-and-investigations`,
  component: MineIncidents,
};

export const MINE_INCIDENT = {
  route: "/mines/:mineGuid/incidents/:mineIncidentGuid",
  dynamicRoute: (mineGuid, mineIncidentGuid) => `/mines/${mineGuid}/incidents/${mineIncidentGuid}`,
  hashRoute: (mineGuid, mineIncidentGuid, link) =>
    `/mines/${mineGuid}/incidents/${mineIncidentGuid}${link}`,
  component: MineIncident,
};

export const CREATE_MINE_INCIDENT = {
  route: "/mines/:mineGuid/new-incident",
  dynamicRoute: (mineGuid) => `/mines/${mineGuid}/new-incident`,
  hashRoute: (mineGuid, link) => `/mines/${mineGuid}/new-incident${link}`,
  component: MineIncident,
};

export const MINE_INSPECTIONS = {
  route: "/mine-dashboard/:id/oversight/inspections-and-audits",
  dynamicRoute: (id, filterParams) =>
    `/mine-dashboard/${id}/oversight/inspections-and-audits?${queryString.stringify(filterParams)}`,
  component: MineComplianceInfo,
};

export const MINE_REPORTS = {
  route: "/mine-dashboard/:id/reports/code-required-reports",
  dynamicRoute: (id, filterParams) =>
    `/mine-dashboard/${id}/reports/code-required-reports?${queryString.stringify(filterParams)}`,
  component: MineReportInfo,
};

export const MINE_PERMIT_REQUIRED_REPORTS = {
  route: "/mine-dashboard/:id/reports/permit-required-reports",
  dynamicRoute: (id, filterParams) =>
    `/mine-dashboard/${id}/reports/permit-required-reports?${queryString.stringify(filterParams)}`,
  component: PermitRequiredReports,
};

export const MINE_TAILINGS = {
  route: "/mine-dashboard/:id/reports/tailings",
  dynamicRoute: (id) => `/mine-dashboard/${id}/reports/tailings`,
  component: MineTailingsInfo,
};

export const PARTY_PROFILE = {
  route: "/dashboard/:id/profile",
  dynamicRoute: (id) => `/dashboard/${id}/profile`,
  component: PartyProfile,
};

export const RELATIONSHIP_PROFILE = {
  route: "/dashboard/:id/history/:typeCode",
  dynamicRoute: (id, typeCode) => `/dashboard/${id}/history/${typeCode}`,
  component: RelationshipProfile,
};

export const REPORTING_DASHBOARD = {
  route: "/dashboard/reporting/general",
  component: ReportingDashboard,
};

export const VARIANCE_DASHBOARD = {
  route: "/dashboard/reporting/variance",
  dynamicRoute: ({ page, per_page, ...params }) =>
    `/dashboard/reporting/variance/?${queryString.stringify(
      { page, per_page, ...params },
      { sort: false }
    )}`,
  component: VarianceHomePage,
};

export const INCIDENTS_DASHBOARD = {
  route: "/dashboard/reporting/incidents",
  dynamicRoute: ({ page, per_page, ...params }) =>
    `/dashboard/reporting/incidents/?${queryString.stringify(
      { page, per_page, ...params },
      { sort: false }
    )}`,
  component: IncidentsHomePage,
};

export const REPORTS_DASHBOARD = {
  route: "/dashboard/reporting/reports",
  dynamicRoute: ({ page, per_page, ...params }) =>
    `/dashboard/reporting/reports?${queryString.stringify(
      { page, per_page, ...withoutNullParams(params) },
      { sort: false }
    )}`,
  component: ReportsHomePage,
};

export const EXECUTIVE_REPORTING_DASHBOARD = {
  route: "/dashboard/reporting/executive-reporting",
  component: ExecutiveReportingDashboard,
};

// Admin Dashboard Routes
export const ADMIN_DASHBOARD = {
  route: "/admin/dashboard",
  component: AdminDashboard,
};

export const ADMIN_PERMIT_CONDITION_MANAGEMENT = {
  route: "/admin/permit-condition-management/:type",
  dynamicRoute: (type) => `/admin/permit-condition-management/${type}`,
  component: AdminPermitConditionManagement,
};

export const ADMIN_EMLI_CONTACT_MANAGEMENT = {
  route: "/admin/minespace-emli-contact-management",
  component: MineSpaceEMLIContactManagement,
};

export const ADMIN_VERIFIED_MINES = {
  route: "/admin/dashboard/mine-verification/:type",
  dynamicRoute: (type) => `/admin/dashboard/mine-verification/${type}`,
  component: AdminVerifiedMinesList,
};

export const ADMIN_MANAGE_MINESPACE_USERS = {
  route: "/admin/dashboard/manage-minespace/users",
  component: MinespaceUserManagement,
};

export const ADMIN_CONTACT_MANAGEMENT = {
  route: "/admin/contact-management/:tab",
  dynamicRoute: (tab) => `/admin/contact-management/${tab}`,
  component: MergeContactsDashboard,
};

export const SEARCH_RESULTS = {
  route: "/search",
  dynamicRoute: ({ q, t }) => (t ? `/search?q=${q}&t=${t}` : `/search?q=${q}`),
  component: SearchResults,
};

export const NOTICE_OF_WORK_APPLICATIONS = {
  route: "/dashboard/reporting/notice-of-work",
  dynamicRoute: (params) => `/dashboard/reporting/notice-of-work?${queryString.stringify(params)}`,
  component: NoticeOfWorkHomePage,
};

export const NOTICE_OF_WORK_APPLICATION = {
  route: "/dashboard/notice-of-work/app/:id/:tab",
  dynamicRoute: (guid, tab) =>
    tab
      ? `/dashboard/notice-of-work/app/${guid}/${tab}`
      : `/dashboard/notice-of-work/app/${guid}/verification`,
  hashRoute: (guid, tab, link) => `/dashboard/notice-of-work/app/${guid}/${tab}/${link}`,
  component: NoticeOfWorkApplication,
};

export const MAJOR_PROJECTS_DASHBOARD = {
  route: "/dashboard/reporting/major-project",
  dynamicRoute: (params = null) =>
    `/dashboard/reporting/major-project/?${queryString.stringify({ ...params }, { sort: false })}`,
  component: MajorProjectHomePage,
};

export const ADMIN_AMENDMENT_APPLICATION = {
  route: "/dashboard/administrative-amendment/app/:id/:tab",
  dynamicRoute: (guid, tab) =>
    tab
      ? `/dashboard/administrative-amendment/app/${guid}/${tab}`
      : `/dashboard/administrative-amendment/app/${guid}/application`,
  hashRoute: (guid, tab, link) => `/dashboard/administrative-amendment/app/${guid}/${tab}/${link}`,
  component: AdminAmendmentApplication,
};

export const VIEW_NOTICE_OF_WORK_APPLICATION = {
  route: "/dashboard/view-notice-of-work/app/:id/:tab",
  dynamicRoute: (guid, tab) =>
    tab
      ? `/dashboard/view-notice-of-work/app/${guid}/${tab}`
      : `/dashboard/view-notice-of-work/app/${guid}/application`,
  hashRoute: (guid, tab, link) => `/dashboard/view-notice-of-work/app/${guid}/${tab}/${link}`,
  component: ViewNoticeOfWorkApplication,
};

export const EDIT_PERMIT_CONDITIONS = {
  route: "/:mine_guid/permit-amendment/:id/edit-permit-conditions",
  dynamicRoute: (mine_guid, id) => `/${mine_guid}/permit-amendment/${id}/edit-permit-conditions`,
  component: PermitConditionManagement,
};

const MINESPACE_URL = "https://minespace.gov.bc.ca/";
export const VIEW_MINESPACE = (mineGuid) =>
  `${MINESPACE_URL}/mines/${mineGuid}/overview?redirectingFromCore=true`;

const ORGBOOK_URL = "https://orgbook.gov.bc.ca";
export const ORGBOOK_ENTITY_URL = (sourceId) => `${ORGBOOK_URL}/en/organization/${sourceId}`;
export const ORGBOOK_CREDENTIAL_URL = (sourceId, credentialId) =>
  `${ORGBOOK_URL}/en/organization/${sourceId}/cred/${credentialId}`;
