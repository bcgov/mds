import queryString from "query-string";
import * as Strings from "@mds/common/constants/strings";
import { isEmpty } from "lodash";
import { getEnvironment } from "@mds/common";
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
import MineApplications from "@/components/mine/NoticeOfWork/MineApplications";
import MineProject from "@/components/mine/Projects/MineProject";
import ProjectSummary from "@/components/mine/Projects/ProjectSummary";
import ExternalAuthorizations from "@/components/mine/ExternalAuthorizations/ExternalAuthorizations";
import HomePage from "@/components/homepage/HomePage";
import NoticeOfWorkHomePage from "@/components/dashboard/noticeOfWorkHomePage/NoticeOfWorkHomePage";
import NoticeOfWorkApplication from "@/components/noticeOfWork/applications/NoticeOfWorkApplication";
import AdminAmendmentApplication from "@/components/noticeOfWork/applications/AdminAmendmentApplication";
import ViewNoticeOfWorkApplication from "@/components/noticeOfWork/applications/ViewNoticeOfWorkApplication";
import MergeContactsDashboard from "@/components/admin/contacts/MergeContactsDashboard";
import MineSpaceEMLIContactManagement from "@/components/admin/contacts/EMLIContacts/MineSpaceEMLIContactManagement";
import PermitConditionManagement from "@/components/mine/Permit/PermitConditionManagement";
import Project from "@/components/mine/Projects/Project";
import MajorMineApplicationTab from "@/components/mine/Projects/MajorMineApplicationTab";
import DecisionPackageTab from "@/components/mine/Projects/DecisionPackageTab";
import MineIncident from "@/components/mine/Incidents/MineIncident";
import MineReportTailingsInfo from "@/components/mine/Tailings/MineReportTailingsInfo";
import MineTailingsDetailsPage from "@/components/mine/Tailings/MineTailingsDetailsPage";
import DamsDetailsPage from "@/components/mine/Tailings/DamsDetailsPage";
import ReportPage from "@/components/mine/Reports/ReportPage";
import ReportSteps from "@mds/common/components/reports/ReportSteps";
import ViewDigitalPermitCredential from "@/components/mine/DigitalPermitCredential/ViewDigitalPermitCredential";
import ComplianceCodeManagement from "@/components/admin/complianceCodes/ComplianceCodeManagement";
import ProjectSubmissionStatusPage from "@mds/common/components/projectSummary/ProjectSubmissionStatusPage";
import ViewPermit from "@/components/mine/Permit/ViewPermit";

const withoutDefaultParams = (params, defaults) => {
  const newParams = JSON.parse(JSON.stringify(params));
  Object.keys(defaults)
    .filter((param) => param in newParams && newParams[param] === defaults[param])
    .forEach((param) => delete newParams[param]);
  return newParams;
};

const withoutNullParams = (params) => {
  const newParams = JSON.parse(JSON.stringify(params));
  Object.keys(params)
    .filter((param) => params[param] === null)
    .forEach((param) => delete newParams[param]);
  return newParams;
};

export const DASHBOARD = {
  route: "/",
  component: Home,
  helpKey: "Home", // defunct
};

export const HOME_PAGE = {
  route: "/home/",
  component: HomePage,
  helpKey: "Home",
};

export const CUSTOM_HOME_PAGE = {
  route: "/my-dashboard/",
  component: CustomHomePage,
  helpKey: "My-Dashboard",
};

export const LOGOUT = {
  route: "/logout-confirmed/",
  component: Logout,
  helpKey: "Logout",
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
  helpKey: "Mines",
};

export const CONTACT_HOME_PAGE = {
  route: "/dashboard/contacts",
  dynamicRoute: ({ page, per_page, ...params }) =>
    `/dashboard/contacts/?${queryString.stringify({ page, per_page, ...params }, { sort: false })}`,
  component: ContactHomePage,
  helpKey: "Contacts",
};

// Mine Dashboard Routes
export const MINE_DASHBOARD = {
  route: "/mine-dashboard/:id/",
  dynamicRoute: (id) => `/mine-dashboard/${id}/`,
  component: MineDashboard,
  helpKey: "Mine-Dashboard",
};

export const MINE_CONTACTS = {
  route: "/mine-dashboard/:id/mine-information/contacts",
  dynamicRoute: (id) => `/mine-dashboard/${id}/mine-information/contacts`,
  component: MineContactInfo,
  helpKey: "Mine-Contacts",
};

export const MINE_GENERAL = {
  route: "/mine-dashboard/:id/mine-information/general",
  dynamicRoute: (id) => `/mine-dashboard/${id}/mine-information/general`,
  component: MineSummary,
  helpKey: "Mine-Summary",
};

export const MINE_DOCUMENTS = {
  route: "/mine-dashboard/:id/mine-information/mms-archive",
  dynamicRoute: (id) => `/mine-dashboard/${id}/mine-information/mms-archive`,
  component: MineDocuments,
  helpKey: "Mine-Documents",
};

export const MINE_PERMITS = {
  route: "/mine-dashboard/:id/permits-and-approvals/permits",
  dynamicRoute: (id) => `/mine-dashboard/${id}/permits-and-approvals/permits`,
  component: MinePermitInfo,
  helpKey: "Mine-Permits",
};

export const VIEW_MINE_PERMIT = {
  route: "/mine-dashboard/:id/permits-and-approvals/permits/:permitGuid/:tab",
  dynamicRoute: (id, permitGuid, tab = "overview") =>
    `/mine-dashboard/${id}/permits-and-approvals/permits/${permitGuid}/${tab}`,
  hashRoute: (id, permitGuid, tab = "overview", link = "") =>
    `/mine-dashboard/${id}/permits-and-approvals/permits/${permitGuid}/${tab}/${link}`,
  component: ViewPermit,
  helpKey: "View-Permit",
};

export const MINE_PERMIT_DIGITAL_CREDENTIALS = {
  route: "/mine-dashboard/:id/permits-and-approvals/digital-credentials/:permitGuid",
  dynamicRoute: (id, permitGuid) =>
    `/mine-dashboard/${id}/permits-and-approvals/digital-credentials/${permitGuid}`,
  component: ViewDigitalPermitCredential,
  helpKey: "Permit-Digital-Credential",
};

export const MINE_SECURITIES = {
  route: "/mine-dashboard/:id/permits-and-approvals/securities",
  dynamicRoute: (id) => `/mine-dashboard/${id}/permits-and-approvals/securities`,
  component: MineSecurityInfo,
  helpKey: "Mine-Securities",
};

export const MINE_VARIANCES = {
  route: "/mine-dashboard/:id/permits-and-approvals/variances",
  dynamicRoute: (id) => `/mine-dashboard/${id}/permits-and-approvals/variances`,
  component: MineVariance,
  helpKey: "Mine-Variances",
};

export const MINE_NOTICES_OF_DEPARTURE = {
  route: "/mine-dashboard/:id/permits-and-approvals/notices-of-departure",
  dynamicRoute: (id) => `/mine-dashboard/${id}/permits-and-approvals/notices-of-departure`,
  component: MineNoticeOfDeparture,
  helpKey: "Mine-Notices-Of-Departure",
};

export const NOTICE_OF_DEPARTURE = {
  route: "/mine-dashboard/:id/permits-and-approvals/notices-of-departure",
  dynamicRoute: (id, nodGuid) =>
    `/mine-dashboard/${id}/permits-and-approvals/notices-of-departure?nod=${nodGuid}`,
  component: MineNoticeOfDeparture,
  helpKey: "Mine-Notices-Of-Departure",
};

// Projects
export const MINE_PRE_APPLICATIONS = {
  route: "/mine-dashboard/:id/permits-and-approvals/pre-applications",
  dynamicRoute: (id) => `/mine-dashboard/${id}/permits-and-approvals/pre-applications`,
  component: MineProject,
  helpKey: "Mine-Pre-Applications",
};

export const ADD_PROJECT_SUMMARY = {
  route: "/mines/:mineGuid/project-description/new/:tab",
  dynamicRoute: (mineGuid, tab = "basic-information") =>
    `/mines/${mineGuid}/project-description/new/${tab}`,
  component: ProjectSummary,
  helpKey: "Add-Project-Summary",
};

export const EDIT_PROJECT_SUMMARY = {
  route: "/pre-applications/:projectGuid/project-description/:projectSummaryGuid/:mode/:tab",
  dynamicRoute: (
    projectGuid,
    projectSummaryGuid,
    activeTab = "basic-information",
    viewMode = true
  ) =>
    `/pre-applications/${projectGuid}/project-description/${projectSummaryGuid}/${
      viewMode ? "view" : "edit"
    }/${activeTab}`,
  component: ProjectSummary,
  helpKey: "Edit-Project-Summary",
};

export const VIEW_PROJECT_SUBMISSION_STATUS_PAGE = {
  route: "/projects/:projectGuid/project-submission-status/:status",
  dynamicRoute: (projectGuid, status) =>
    `/projects/${projectGuid}/project-submission-status/${status}`,
  component: ProjectSubmissionStatusPage,
  helpKey: "Project-Submission-Status",
};

export const EDIT_PROJECT = {
  route: "/pre-applications/:projectGuid/:tab",
  dynamicRoute: (projectGuid, tab = "overview") => `/pre-applications/${projectGuid}/${tab}`,
  hashRoute: (projectGuid, tab = "overview", link) =>
    `/pre-applications/${projectGuid}/${tab}/${link}`,
  component: Project,
  helpKey: "Edit-Project",
};

export const MAJOR_MINE_APPLICATION = {
  route: "/pre-applications/:projectGuid/major-mine-application/:mmaGuid/:tab",
  dynamicRoute: (projectGuid, mmaGuid, tab = "final-app") =>
    `/pre-applications/${projectGuid}/major-mine-application/${mmaGuid}/${tab}`,
  component: MajorMineApplicationTab,
  helpKey: "Major-Mine-Application",
};

export const PROJECT_FINAL_APPLICATION = {
  route: "/pre-applications/:projectGuid/final-app",
  dynamicRoute: (projectGuid) => `/pre-applications/${projectGuid}/final-app`,
  hashRoute: (projectGuid, link) => `/pre-applications/${projectGuid}/final-app/${link}`,
  component: MajorMineApplicationTab,
  helpKey: "Major-Mine-Application",
};

export const PROJECT_DECISION_PACKAGE = {
  route: "/pre-applications/:projectGuid/project-decision-package",
  dynamicRoute: (projectGuid) => `/pre-applications/${projectGuid}/project-decision-package`,
  hashRoute: (projectGuid, link) =>
    `/pre-applications/${projectGuid}/project-decision-package/${link}`,
  component: DecisionPackageTab,
  helpKey: "Project-Decision-Package",
};

export const MINE_NOW_APPLICATIONS = {
  route: "/mine-dashboard/:id/permits-and-approvals/applications",
  dynamicRoute: (id, params?) =>
    `/mine-dashboard/${id}/permits-and-approvals/applications?${queryString.stringify(params)}`,
  component: MineApplications,
  helpKey: "Mine-Notice-Of-Work-Applications",
};

export const MINE_TAILINGS = {
  route: "/mine-dashboard/:id/permits-and-approvals/tailings",
  dynamicRoute: (id) => `/mine-dashboard/${id}/permits-and-approvals/tailings`,
  component: MineTailingsInfo,
  helpKey: "Mine-Tailings",
};

export const MINE_TAILINGS_DETAILS = {
  route:
    "/mine-dashboard/:id/permits-and-approvals/tailings/:tailingsStorageFacilityGuid/:tab/:userAction",
  dynamicRoute: (tsfGuid, mineGuid, tab = "basic-information", isEditMode = false) =>
    `/mine-dashboard/${mineGuid}/permits-and-approvals/tailings/${tsfGuid}/${tab}/${
      isEditMode ? "edit" : "view"
    }`,
  component: MineTailingsDetailsPage,
  helpKey: "Mine-Tailings-Details",
};

export const EDIT_TAILINGS_STORAGE_FACILITY = {
  // identical to above route: MERGE
  route:
    "/mine-dashboard/:id/permits-and-approvals/tailings/:tailingsStorageFacilityGuid/:tab/:userAction",
  dynamicRoute: (tsfGuid, mineGuid, tab = "basic-information", isEditMode = false) =>
    `/mine-dashboard/${mineGuid}/permits-and-approvals/tailings/${tsfGuid}/${tab}/${
      isEditMode ? "edit" : "view"
    }`,
  component: MineTailingsDetailsPage,
  helpKey: "Mine-Tailings-Details",
};

export const MINE_EXTERNAL_AUTHORIZATIONS = {
  route: "/mine-dashboard/:id/external-authorizations",
  dynamicRoute: (id) => `/mine-dashboard/${id}/external-authorizations`,
  component: ExternalAuthorizations,
  helpKey: "Mine-External-Authorizations",
};

export const MINE_INCIDENTS = {
  route: "/mine-dashboard/:id/oversight/incidents-and-investigations",
  dynamicRoute: (id) => `/mine-dashboard/${id}/oversight/incidents-and-investigations`,
  component: MineIncidents,
  helpKey: "Mine-Incidents",
};

export const EDIT_MINE_INCIDENT = {
  route: "/mines/:mineGuid/incidents/:mineIncidentGuid/edit",
  dynamicRoute: (mineGuid, mineIncidentGuid) =>
    `/mines/${mineGuid}/incidents/${mineIncidentGuid}/edit`,
  hashRoute: (mineGuid, mineIncidentGuid, link) =>
    `/mines/${mineGuid}/incidents/${mineIncidentGuid}/edit${link}`,
  component: MineIncident,
  helpKey: "Edit-Mine-Incident",
};

export const VIEW_MINE_INCIDENT = {
  route: "/mines/:mineGuid/incidents/:mineIncidentGuid",
  dynamicRoute: (mineGuid, mineIncidentGuid) => `/mines/${mineGuid}/incidents/${mineIncidentGuid}`,
  hashRoute: (mineGuid, mineIncidentGuid, link) =>
    `/mines/${mineGuid}/incidents/${mineIncidentGuid}${link}`,
  component: MineIncident,
  helpKey: "View-Mine-Incident",
};

export const CREATE_MINE_INCIDENT = {
  route: "/mines/:mineGuid/new-incident",
  dynamicRoute: (mineGuid) => `/mines/${mineGuid}/new-incident`,
  hashRoute: (mineGuid, mine_name, link) =>
    `/mines/${mineGuid}/new-incident?mine_name=${mine_name}${link}`,
  component: MineIncident,
  helpKey: "New-Mine-Incident",
};

export const MINE_INSPECTIONS = {
  route: "/mine-dashboard/:id/oversight/inspections-and-audits",
  dynamicRoute: (id, filterParams?) =>
    `/mine-dashboard/${id}/oversight/inspections-and-audits?${queryString.stringify(filterParams)}`,
  component: MineComplianceInfo,
  helpKey: "Mine-Inspections",
};

export const MINE_TAILINGS_REPORTS = {
  route: "/mine-dashboard/:id/reports/tailings-reports",
  dynamicRoute: (id) => `/mine-dashboard/${id}/reports/tailings-reports`,
  component: MineReportTailingsInfo,
  helpKey: "Mine-Tailings-Reports",
};

export const MINE_REPORTS = {
  route: "/mine-dashboard/:id/required-reports/:reportType",
  dynamicRoute: (id, reportType, filterParams) =>
    `/mine-dashboard/${id}/required-reports/${reportType}?${queryString.stringify(filterParams)}`,
  component: MineReportInfo,
  helpKey: "Mine-Reports",
};

export const REPORT_VIEW_EDIT = {
  route: "/dashboard/reporting/mine/:mineGuid/report/:reportGuid",
  dynamicRoute: (mineGuid: string, reportGuid: string) =>
    `/dashboard/reporting/mine/${mineGuid}/report/${reportGuid}`,
  hashRoute: (mineGuid: string, reportGuid: string, link) =>
    `/dashboard/reporting/mine/${mineGuid}/report/${reportGuid}/${link}`,
  component: ReportPage,
  helpKey: "Report",
};

export const REPORTS_CREATE_NEW = {
  route: "/mines/:mineGuid/reports/new/:reportType",
  dynamicRoute: (mineGuid, reportType) => `/mines/${mineGuid}/reports/new/${reportType}`,
  component: ReportSteps,
  helpKey: "New-Report",
};

export const PARTY_PROFILE = {
  route: "/dashboard/:id/profile",
  dynamicRoute: (id) => `/dashboard/${id}/profile`,
  component: PartyProfile,
  helpKey: "Party-Profile",
};

export const RELATIONSHIP_PROFILE = {
  route: "/dashboard/:id/history/:typeCode",
  dynamicRoute: (id, typeCode) => `/dashboard/${id}/history/${typeCode}`,
  component: RelationshipProfile,
  helpKey: "Relationship-Profile",
};

export const REPORTING_DASHBOARD = {
  route: "/dashboard/reporting/general",
  component: ReportingDashboard,
  helpKey: "Reporting-Dashboard",
};

export const VARIANCE_DASHBOARD = {
  route: "/dashboard/reporting/variance",
  dynamicRoute: ({ page, per_page, ...params }) =>
    `/dashboard/reporting/variance/?${queryString.stringify(
      { page, per_page, ...params },
      { sort: false }
    )}`,
  component: VarianceHomePage,
  helpKey: "Variances",
};

export const INCIDENTS_DASHBOARD = {
  route: "/dashboard/reporting/incidents",
  dynamicRoute: ({ page, per_page, ...params }) =>
    `/dashboard/reporting/incidents/?${queryString.stringify(
      { page, per_page, ...params },
      { sort: false }
    )}`,
  component: IncidentsHomePage,
  helpKey: "Incidents",
};

export const REPORTS_DASHBOARD = {
  route: "/dashboard/reporting/reports",
  dynamicRoute: ({ page = Strings.DEFAULT_PAGE, per_page = Strings.DEFAULT_PER_PAGE, ...params }) =>
    `/dashboard/reporting/reports?${queryString.stringify(
      { page, per_page, ...withoutNullParams(params) },
      { sort: false }
    )}`,
  component: ReportsHomePage,
  helpKey: "Reports",
};

export const EXECUTIVE_REPORTING_DASHBOARD = {
  route: "/dashboard/reporting/executive-reporting",
  component: ExecutiveReportingDashboard,
  helpKey: "Executive-Reporting-Dashboard",
};

// Admin Dashboard Routes
export const ADMIN_DASHBOARD = {
  route: "/admin/dashboard",
  component: AdminDashboard,
  helpKey: "Admin-Dashbaord",
};

export const ADMIN_PERMIT_CONDITION_MANAGEMENT = {
  route: "/admin/permit-condition-management/:type",
  dynamicRoute: (type) => `/admin/permit-condition-management/${type}`,
  component: AdminPermitConditionManagement,
  helpKey: "Permit-Condition-Management",
};

export const ADMIN_EMLI_CONTACT_MANAGEMENT = {
  route: "/admin/minespace-emli-contact-management",
  component: MineSpaceEMLIContactManagement,
  helpKey: "MineSpace-EMLI-Contact-Management",
};

export const ADMIN_VERIFIED_MINES = {
  route: "/admin/dashboard/mine-verification/:type",
  dynamicRoute: (type) => `/admin/dashboard/mine-verification/${type}`,
  component: AdminVerifiedMinesList,
  helpKey: "Verified-Mines",
};

export const ADMIN_MANAGE_MINESPACE_USERS = {
  route: "/admin/dashboard/manage-minespace/users",
  component: MinespaceUserManagement,
  helpKey: "MineSpace-User-Management",
};

export const ADMIN_CONTACT_MANAGEMENT = {
  route: "/admin/contact-management/:tab",
  dynamicRoute: (tab) => `/admin/contact-management/${tab}`,
  component: MergeContactsDashboard,
  helpKey: "Contact-Management",
};

export const ADMIN_HSRC_COMPLIANCE_CODE_MANAGEMENT = {
  route: "/admin/hsrc-management",
  component: ComplianceCodeManagement,
  helpKey: "HSRC-Code-Management",
};

export const SEARCH_RESULTS = {
  route: "/search",
  dynamicRoute: ({ q, t = null }) => (t ? `/search?q=${q}&t=${t}` : `/search?q=${q}`),
  component: SearchResults,
  helpKey: "Search-Results",
};

export const NOTICE_OF_WORK_APPLICATIONS = {
  route: "/dashboard/reporting/notice-of-work",
  dynamicRoute: (params) => `/dashboard/reporting/notice-of-work?${queryString.stringify(params)}`,
  component: NoticeOfWorkHomePage,
  helpKey: "Notices-Of-Work",
};

export const NOTICE_OF_WORK_APPLICATION = {
  route: "/dashboard/notice-of-work/app/:id/:tab",
  dynamicRoute: (guid, tab) =>
    tab
      ? `/dashboard/notice-of-work/app/${guid}/${tab}`
      : `/dashboard/notice-of-work/app/${guid}/verification`,
  hashRoute: (guid, tab, link) => `/dashboard/notice-of-work/app/${guid}/${tab}/${link}`,
  component: NoticeOfWorkApplication,
  helpKey: "Notice-Of-Work-Application",
};

export const MAJOR_PROJECTS_DASHBOARD = {
  route: "/dashboard/reporting/major-project",
  dynamicRoute: (params = null) =>
    `/dashboard/reporting/major-project/?${queryString.stringify({ ...params }, { sort: false })}`,
  component: MajorProjectHomePage,
  helpKey: "Major-Projects",
};

export const ADMIN_AMENDMENT_APPLICATION = {
  route: "/dashboard/administrative-amendment/app/:id/:tab",
  dynamicRoute: (guid, tab) =>
    tab
      ? `/dashboard/administrative-amendment/app/${guid}/${tab}`
      : `/dashboard/administrative-amendment/app/${guid}/application`,
  hashRoute: (guid, tab, link) => `/dashboard/administrative-amendment/app/${guid}/${tab}/${link}`,
  component: AdminAmendmentApplication,
  helpKey: "Administrative-Amendment",
};

export const VIEW_NOTICE_OF_WORK_APPLICATION = {
  route: "/dashboard/view-notice-of-work/app/:id/:tab",
  dynamicRoute: (guid, tab) =>
    tab
      ? `/dashboard/view-notice-of-work/app/${guid}/${tab}`
      : `/dashboard/view-notice-of-work/app/${guid}/application`,
  hashRoute: (guid, tab, link) => `/dashboard/view-notice-of-work/app/${guid}/${tab}/${link}`,
  component: ViewNoticeOfWorkApplication,
  helpKey: "View-Notice-Of-Work",
};

export const EDIT_PERMIT_CONDITIONS = {
  // this is the old page
  route: "/:mine_guid/permit-amendment/:id/edit-permit-conditions",
  dynamicRoute: (mine_guid, id) => `/${mine_guid}/permit-amendment/${id}/edit-permit-conditions`,
  component: PermitConditionManagement,
  helpKey: "Edit-Permit-Conditions",
};

const MINESPACE_URLS = {
  production: "https://minespace.gov.bc.ca/",
  development: "https://minespace-dev.apps.silver.devops.gov.bc.ca/",
  test: "https://minespace-test.apps.silver.devops.gov.bc.ca/",
};

export const VIEW_MINESPACE = (mineGuid) => {
  const MINESPACE_URL = MINESPACE_URLS[getEnvironment() ?? "production"];
  return `${MINESPACE_URL}mines/${mineGuid}/overview?redirectingFromCore=true`;
};

const ORGBOOK_URL = "https://orgbook.gov.bc.ca";
export const ORGBOOK_ENTITY_URL = (sourceId) => `${ORGBOOK_URL}/entity/${sourceId}`;
export const ORGBOOK_CREDENTIAL_URL = (sourceId, credentialId) =>
  `${ORGBOOK_URL}/entity/${sourceId}/cred/${credentialId}`;
export const ADD_DAM = {
  route:
    "/mine-dashboard/:mineGuid/tailings-storage-facility/:tailingsStorageFacilityGuid/dam/:parentTSFFormMode/:userAction",
  dynamicRoute: (mineGuid, tailingsStorageFacilityGuid, editMode = "edit", userAction = "newDam") =>
    `/mine/${mineGuid}/tailings-storage-facility/${tailingsStorageFacilityGuid}/dam/${editMode}/${userAction}`,
  component: DamsDetailsPage,
  helpKey: "Dam-Details",
};

export const EDIT_DAM = {
  route:
    "/mine-dashboard/:mineGuid/tailings-storage-facility/:tailingsStorageFacilityGuid/:parentTSFFormMode/:userAction/dam/:damGuid",
  dynamicRoute: (
    mineGuid,
    tailingsStorageFacilityGuid,
    damGuid,
    isEditMode = false,
    canEditDam = false
  ) =>
    `/mine-dashboard/${mineGuid}/tailings-storage-facility/${tailingsStorageFacilityGuid}/${
      isEditMode ? "edit" : "view"
    }/${canEditDam ? "editDam" : "viewDam"}/dam/${damGuid}`,
  component: DamsDetailsPage,
  helpKey: "Edit-Dam",
};
