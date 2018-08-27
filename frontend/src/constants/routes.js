// internal URL's
import Home from '@/components/Home';
import Dashboard from '@/components/dashboard/Dashboard';
import MineContainer from '@/components/mine/MineContainer';

export const DASHBOARD = {
    route: '/',
    component: Home,
};

export const MINE_DASHBOARD = {
  route: '/dashboard',
  dynamicRoute: (page, per_page) => `/dashboard?page=${page}&per_page=${per_page}`,
  component: Dashboard,
};

export const MINE_SUMMARY = {
  route: '/dashboard/:id/summary',
  dynamicRoute: (id) => `/dashboard/${id}/summary`,
  component: MineContainer,
};

