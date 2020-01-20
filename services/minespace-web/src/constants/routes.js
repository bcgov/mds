import LandingPage from "@/components/landingPage/LandingPage";
import UserDashboard from "@/components/dashboard/UserDashboard";
import Reports from "@/components/dashboard/mine/reports/Reports";
import Variances from "@/components/dashboard/mine/variances/Variances";
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

export const MINE_DASHBOARD = {
  route: "/dashboard/mine/:id",
  dynamicRoute: (id) => `/dashboard/mine/${id}`,
  component: MineDashboard,
};

export const VARIANCES = {
  route: "/dashboard/mine/:id/variances",
  dynamicRoute: (id) => `/dashboard/mine/${id}/variances`,
  component: Variances,
};

export const REPORTS = {
  route: "/dashboard/mine/:id/reports",
  dynamicRoute: (id) => `/dashboard/mine/${id}/reports`,
  component: Reports,
};

export const MOCKUP = {
  route: "/mockup",
  component: Mockup,
};
