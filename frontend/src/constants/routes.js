import queryString from "query-string";
import Home from "@/components/Home";
import Dashboard from "@/components/dashboard/minesHomePage/Dashboard";
import ContactHomePage from "@/components/dashboard/contactsHomePage/ContactHomePage";
import MineDashboard from "@/components/mine/MineDashboard";
import PartyProfile from "@/components/parties/PartyProfile";
import RelationshipProfile from "@/components/parties/RelationshipProfile";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const DASHBOARD = {
  route: "/",
  component: Home,
};

export const MINE_HOME_PAGE = {
  route: "/dashboard/mines",
  dynamicRoute: ({ page, per_page, ...params }) =>
    `/dashboard/mines/?${queryString.stringify({ page, per_page, ...params }, { sort: false })}`,
  mapRoute: (page, perPage, search = null) => {
    const searchParam = search ? `&search=${search}` : "";
    return `/dashboard/mines?page=${page}&per_page=${perPage}${searchParam}&map=true`;
  },
  component: Dashboard,
};

export const CONTACT_HOME_PAGE = {
  route: "/dashboard/contacts",
  dynamicRoute: ({ page, per_page }) =>
    `/dashboard/contacts/?${queryString.stringify({ page, per_page })}`,
  component: ContactHomePage,
};

export const MINE_SUMMARY = {
  route: "/dashboard/:id/:activeTab",
  dynamicRoute: (id, activeTab = "summary") => `/dashboard/${id}/${activeTab}`,
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
