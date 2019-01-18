import Home from "@/components/Home";
import ProponentDashboard from "@/components/dashboard/ProponentDashboard";
import ProponentMineInfo from "@/components/dashboard/ProponentMineInfo";

export const HOME = {
  route: "/",
  component: Home,
};

export const DASHBOARD = {
  route: "/dashboard",
  component: ProponentDashboard,
};

export const MINE_INFO = {
  route: "/dashboard/mine/:mine_id",
  dynamicRoute: (mine_id) => `/dashboard/mine/${mine_id}`,
  component: ProponentMineInfo,
};
