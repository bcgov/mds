import Home from "@/components/Home";
import UserDashboard from "@/components/dashboard/UserDashboard";
import MineInfo from "@/components/dashboard/mineInfo/MineInfo";
import ReturnPage from "@/components/ReturnPage";

export const HOME = {
  route: "/",
  component: Home,
};

export const RETURN_PAGE = {
  route: "/return-page",
  component: ReturnPage,
};

export const DASHBOARD = {
  route: "/dashboard",
  component: UserDashboard,
};

export const MINE_INFO = {
  route: "/dashboard/mine/:mineId",
  dynamicRoute: (mineId) => `/dashboard/mine/${mineId}`,
  component: MineInfo,
};
