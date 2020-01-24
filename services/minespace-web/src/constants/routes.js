import queryString from "query-string";
import LandingPage from "@/components/landingPage/LandingPage";
import UserDashboard from "@/components/dashboard/UserDashboard";
import MineDashboard from "@/components/dashboard/mine/MineDashboard";
import ReturnPage from "@/components/ReturnPage";
import Mockup from "@/components/Mockup";

export const HOME = {
  route: "/",
  component: LandingPage,
};

export const RETURN_PAGE = {
  route: "/return-page",
  component: ReturnPage,
};

export const DASHBOARD = {
  route: "/dashboard",
  component: UserDashboard,
};

export const MINE_DASHBOARD_OLD = {
  route: "/dashboard/mine/:id",
  dynamicRoute: (id) => `/dashboard/mine/${id}/overview`,
  component: MineDashboard,
};

export const MINE_DASHBOARD = {
  route: "/dashboard/mine/:id/:activeTab",
  dynamicRoute: (id, activeTab = "overview", filterParams) =>
    `/dashboard/mine/${id}/${activeTab}?${queryString.stringify(filterParams)}`,
  component: MineDashboard,
};

export const MOCKUP = {
  route: "/mockup",
  component: Mockup,
};
