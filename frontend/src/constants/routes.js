import queryString from "query-string";
import Home from "@/components/Home";
import Dashboard from "@/components/dashboard/minesHomePage/Dashboard";
import ContactHomePage from "@/components/dashboard/contactsHomePage/ContactHomePage";
import MineDashboard from "@/components/mine/MineDashboard";
import PartyProfile from "@/components/parties/PartyProfile";
import RelationshipProfile from "@/components/parties/RelationshipProfile";
import AdminDashboard from "@/components/admin/AdminDashboard";
import CustomHomePage from "@/components/dashboard/customHomePage/CustomHomePage";

export const DASHBOARD = {
  route: "/",
  component: Home,
};

export const CUSTOM_HOME_PAGE = {
  route: "/home/",
  component: CustomHomePage,
};

export const MINE_HOME_PAGE = {
  route: "/dashboard/mines",
  dynamicRoute: ({ page, per_page, ...params }) =>
    `/dashboard/mines/?${queryString.stringify({ page, per_page, ...params }, { sort: false })}`,
  mapRoute: (lat = null, long = null, zoom = null, mineName = null) => {
    let searchParam = lat ? `lat=${lat}` : "";
    searchParam += long ? `&long=${long}` : "";
    searchParam += zoom ? `&zoom=${zoom}` : "";
    searchParam += mineName ? `&mineName=${mineName}` : "";
    return `/dashboard/mines?map=true&${searchParam}`;
  },
  component: Dashboard,
};

export const CONTACT_HOME_PAGE = {
  route: "/dashboard/contacts",
  dynamicRoute: ({ page, per_page, ...params }) =>
    `/dashboard/contacts/?${queryString.stringify({ page, per_page, ...params }, { sort: false })}`,
  component: ContactHomePage,
};

export const MINE_SUMMARY = {
  route: "/dashboard/:id/:activeTab",
  dynamicRoute: (id, activeTab = "summary", filterParams) =>
    `/dashboard/${id}/${activeTab}?${queryString.stringify(filterParams)}`,
  component: MineDashboard,
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

export const ADMIN_DASHBOARD = {
  route: "/admin/dashboard",
  component: AdminDashboard,
};
