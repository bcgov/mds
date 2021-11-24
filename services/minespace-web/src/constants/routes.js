import queryString from "query-string";
import LandingPage from "@/components/pages/LandingPage";
import MinesPage from "@/components/pages/MinesPage";
import UsersPage from "@/components/pages/UsersPage";
import MineDashboard from "@/components/dashboard/mine/MineDashboard";
import ReturnPage from "@/components/pages/ReturnPage";
import ProjectSummaryPage from "@/components/pages/ProjectSummaryPage";

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
  route: "/mines/:mineGuid/project-summary/new",
  dynamicRoute: (mineGuid) =>
    `/mines/${mineGuid}/project-summary/new`,
  component: ProjectSummaryPage,
}

export const EDIT_PROJECT_SUMMARY = {
  route: "/mines/:mineGuid/project-summary/:projectSummaryGuid",
  dynamicRoute: (mineGuid, projectSummaryGuid) =>
    `/mines/${mineGuid}/project-summary/${projectSummaryGuid}`,
  component: ProjectSummaryPage,
}

export const MINE_DASHBOARD = {
  route: "/mines/:id/:activeTab",
  dynamicRoute: (id, activeTab = "overview", filterParams) =>
    `/mines/${id}/${activeTab}?${queryString.stringify(filterParams)}`,
  component: MineDashboard,
};
