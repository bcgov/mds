import queryString from "query-string";
import LandingPage from "@/components/pages/LandingPage";
import MinesPage from "@/components/pages/MinesPage";
import UsersPage from "@/components/pages/UsersPage";
import MineDashboard from "@/components/dashboard/mine/MineDashboard";
import ReturnPage from "@/components/pages/ReturnPage";

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

export const MINE_DASHBOARD = {
  route: "/mines/:id/:activeTab",
  dynamicRoute: (id, activeTab = "overview", filterParams) =>
    `/mines/${id}/${activeTab}?${queryString.stringify(filterParams)}`,
  component: MineDashboard,
};
