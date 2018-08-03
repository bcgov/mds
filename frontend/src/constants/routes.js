import Home from '@/components/Home';
import MineDashboard from '@/components/mine/MineDashboard';
import CreateMineForm from '@/components/mine/CreateMineForm';
import MineSummary from '@/components/mine/MineSummary';
import Dashboard from '@/components/dashboard/Dashboard';

export const HOME = {
    route: '/',
    component: Home,
};

export const DASHBOARD = {
    route: '/dashboard',
    component: Dashboard,
};

export const MINE_DASHBOARD = {
  route: '/dashboard/mine',
  component: MineDashboard,
};

export const CREATE_MINE_RECORD = {
  route: '/dashboard/mine/create',
  component: CreateMineForm,
};

export const MINE_SUMMARY = {
  route: '/dashboard/mine/summary/:id',
  dynamicRoute: (id) => `/dashboard/mine/summary/${id}`,
  component: MineSummary,
};