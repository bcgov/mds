import MineDashboard from '@/components/mine/MineDashboard';
import CreateMineForm from '@/components/mine/CreateMineForm';
import MineSummary from '@/components/mine/MineSummary';
import Dashboard from '@/components/dashboard/Dashboard';

export const DASHBOARD = {
    route: '/',
    component: Dashboard,
};

export const MINE_DASHBOARD = {
  route: '/dashboard',
  component: MineDashboard,
};

export const CREATE_MINE_RECORD = {
  route: '/dashboard/create-mining-mine',
  component: CreateMineForm,
};

export const MINE_SUMMARY = {
  route: '/dashboard/:id/summary',
  dynamicRoute: (id) => `/dashboard/${id}/summary`,
  component: MineSummary,
};