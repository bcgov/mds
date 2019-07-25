import queryString from "query-string";
import Home from "@/components/Home";
import Logout from "@/components/common/Logout";
import Dashboard from "@/components/dashboard/minesHomePage/Dashboard";
import ContactHomePage from "@/components/dashboard/contactsHomePage/ContactHomePage";
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
import MineApplicationInfo from "@/components/mine/Applications/MineApplicationInfo";
import MinePermitInfo from "@/components/mine/Permit/MinePermitInfo";
import HomePage from "@/components/dashboard/HomePage";

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
  route: "/dashboard/:id/",
  dynamicRoute: (id) => `/dashboard/${id}/`,
  component: MineDashboard,
};

export const MINE_CONTACTS = {
  route: "/dashboard/:id/mine-information/contacts",
  dynamicRoute: (id) => `/dashboard/${id}/mine-information/contacts`,
  component: MineContactInfo,
};

export const MINE_GENERAL = {
  route: "/dashboard/:id/mine-information/general",
  dynamicRoute: (id) => `/dashboard/${id}/mine-information/general`,
  component: MineSummary,
};

export const MINE_PERMIT_APPLICATIONS = {
  route: "/dashboard/:id/permits-and-approvals/permit-applications",
  dynamicRoute: (id) => `/dashboard/${id}/permits-and-approvals/permit-applications`,
  component: MineApplicationInfo,
};

export const MINE_PERMITS = {
  route: "/dashboard/:id/permits-and-approvals/permits",
  dynamicRoute: (id) => `/dashboard/${id}/permits-and-approvals/permits`,
  component: MinePermitInfo,
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
  route: "/dashboard/reporting",
  component: ReportingDashboard,
};

export const EXECUTIVE_REPORTING_DASHBOARD = {
  route: "/dashboard/execreporting",
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
