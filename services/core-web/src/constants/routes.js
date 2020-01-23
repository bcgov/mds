import queryString from "query-string";
import Home from "@/components/Home";
import Logout from "@/components/common/Logout";
import Dashboard from "@/components/dashboard/minesHomePage/Dashboard";
import ContactHomePage from "@/components/dashboard/contactsHomePage/ContactHomePage";
import VarianceHomePage from "@/components/dashboard/varianceHomePage/VarianceHomePage";
import IncidentsHomePage from "@/components/dashboard/incidentsHomePage/IncidentsHomePage";
import MineDashboard from "@/components/mine/MineDashboard";
import PartyProfile from "@/components/parties/PartyProfile";
import RelationshipProfile from "@/components/parties/RelationshipProfile";
import AdminDashboard from "@/components/admin/AdminDashboard";
import ReportingDashboard from "@/components/dashboard/reporting/ReportingDashboard";
import ExecutiveReportingDashboard from "@/components/dashboard/reporting/ExecutiveReportingDashboard";
import SearchResults from "@/components/search/SearchResults";
import CustomHomePage from "@/components/dashboard/customHomePage/CustomHomePage";
import MineSummary from "@/components/mine/Summary/MineSummary";
import MineContactInfo from "@/components/mine/ContactInfo/MineContactInfo";
import MinePermitInfo from "@/components/mine/Permit/MinePermitInfo";
import MineVariance from "@/components/mine/Variances/MineVariance";
import MineComplianceInfo from "@/components/mine/Compliance/MineComplianceInfo";
import MineIncidents from "@/components/mine/Incidents/MineIncidents";
import MineTailingsInfo from "@/components/mine/Tailings/MineTailingsInfo";
import MineReportInfo from "@/components/mine/Reports/MineReportInfo";
import MineNOWApplications from "@/components/mine/NoticeOfWork/MineNOWApplications";
import HomePage from "@/components/dashboard/HomePage";
import NoticeOfWorkHomePage from "@/components/dashboard/noticeOfWorkHomePage/NoticeOfWorkHomePage";
import NoticeOfWorkApplication from "@/components/noticeOfWork/applications/NoticeOfWorkApplication";
import ViewNoticeOfWorkApplication from "@/components/noticeOfWork/applications/ViewNoticeOfWorkApplication";

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

export const MINE_HOME_PAGE = {
  route: "/dashboard/mines",
  dynamicRoute: ({ page, per_page, ...params }) =>
    `/dashboard/mines/?${queryString.stringify({ page, per_page, ...params }, { sort: false })}`,
  mapRoute: (mapParam = null) =>
    `/dashboard/mines?map=true&${queryString.stringify({ ...mapParam }, { sort: false })}`,
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

export const MINE_PERMITS = {
  route: "/mine-dashboard/:id/permits-and-approvals/permits",
  dynamicRoute: (id) => `/mine-dashboard/${id}/permits-and-approvals/permits`,
  component: MinePermitInfo,
};

export const MINE_VARIANCES = {
  route: "/mine-dashboard/:id/permits-and-approvals/variances",
  dynamicRoute: (id) => `/mine-dashboard/${id}/permits-and-approvals/variances`,
  component: MineVariance,
};

export const MINE_NOW_APPLICATIONS = {
  route: "/mine-dashboard/:id/permits-and-approvals/notice-of-work",
  dynamicRoute: (id, params) =>
    `/mine-dashboard/${id}/permits-and-approvals/notice-of-work?${queryString.stringify(params)}`,
  component: MineNOWApplications,
};

export const MINE_INCIDENTS = {
  route: "/mine-dashboard/:id/oversight/incidents-and-investigations",
  dynamicRoute: (id) => `/mine-dashboard/${id}/oversight/incidents-and-investigations`,
  component: MineIncidents,
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
  route: "/dashboard/incidents",
  dynamicRoute: ({ page, per_page, ...params }) =>
    `/dashboard/incidents/?${queryString.stringify(
      { page, per_page, ...params },
      { sort: false }
    )}`,
  component: IncidentsHomePage,
};

export const EXECUTIVE_REPORTING_DASHBOARD = {
  route: "/dashboard/reporting/executive-reporting",
  component: ExecutiveReportingDashboard,
};

export const ADMIN_DASHBOARD = {
  route: "/admin/dashboard",
  component: AdminDashboard,
};

export const SEARCH_RESULTS = {
  route: "/search",
  dynamicRoute: ({ q, t }) => (t ? `/search?q=${q}&t=${t}` : `/search?q=${q}`),
  component: SearchResults,
};

export const NOTICE_OF_WORK_APPLICATIONS = {
  route: "/dashboard/reporting/notice-of-work",
  dynamicRoute: ({ page, per_page, ...params }) =>
    `/dashboard/reporting/notice-of-work?${queryString.stringify(
      { page, per_page, ...params },
      { sort: false }
    )}`,
  component: NoticeOfWorkHomePage,
};

export const CREATE_NOTICE_OF_WORK_APPLICATION = {
  route: "/dashboard/notice-of-work/application/",
  component: NoticeOfWorkApplication,
};

export const NOTICE_OF_WORK_APPLICATION = {
  route: "/dashboard/notice-of-work/application/:id/",
  dynamicRoute: (guid) => `/dashboard/notice-of-work/application/${guid}/`,
  hashRoute: (guid, link) => `/dashboard/notice-of-work/application/${guid}/${link}`,
  component: NoticeOfWorkApplication,
};

export const VIEW_NOTICE_OF_WORK_APPLICATION = {
  route: "/dashboard/notice-of-work/application/:id/view",
  dynamicRoute: (guid) => `/dashboard/notice-of-work/application/${guid}/view`,
  hashRoute: (guid, link) => `/dashboard/notice-of-work/application/${guid}/view${link}`,
  component: ViewNoticeOfWorkApplication,
};
