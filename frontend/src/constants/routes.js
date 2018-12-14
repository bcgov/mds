import queryString from "query-string";
import Home from "@/components/Home";
import Dashboard from "@/components/dashboard/Dashboard";
import MineDashboard from "@/components/mine/MineDashboard";
import PartyProfile from "@/components/parties/PartyProfile";

export const DASHBOARD = {
  route: "/",
  component: Home,
};

export const MINE_DASHBOARD = {
  route: "/dashboard",
  dynamicRoute: ({ page, per_page, ...params }) =>
    `/dashboard?${queryString.stringify({ page, per_page, ...params })}`,
  mapRoute: (page, perPage, search = null) => {
    const searchParam = search ? `&search=${search}` : "";
    return `/dashboard?page=${page}&per_page=${perPage}${searchParam}&map=true`;
  },
  component: Dashboard,
};

export const MINE_SUMMARY = {
  route: "/dashboard/:id/:activeTab",
  dynamicRoute: (id, activeTab = "summary") => `/dashboard/${id}/${activeTab}`,
  component: MineDashboard,
};

export const PARTY_PROFILE = {
  route: "/profile/:id",
  dynamicRoute: (id) => `/profile/${id}`,
  component: PartyProfile,
};
