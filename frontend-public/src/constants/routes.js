import Home from "@/components/Home";
import UserDashboard from "@/components/dashboard/UserDashboard";
import UserMineInfo from "@/components/dashboard/UserMineInfo";

export const HOME = {
  route: "/",
  component: Home,
};

export const DASHBOARD = {
  route: "/dashboard",
  component: UserDashboard,
};

export const MINE_INFO = {
  route: "/dashboard/mine/:mine_id",
  dynamicRoute: (mine_id) => `/dashboard/mine/${mine_id}`,
  component: UserMineInfo,
};
