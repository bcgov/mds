import Home from '@/components/Home';
import Dashboard from '@/components/Dashboard';
import MineContainer from '@/components/mine/MineContainer';
import CreateMineForm from '@/components/mine/CreateMineForm';
// import MineSummary from '@/components/mine/MineSummary';

export const DASHBOARD = {
    route: '/',
    component: Home,
};

export const MINE_DASHBOARD = {
  route: '/dashboard',
  component: Dashboard,
};

export const MINE_SUMMARY = {
  route: '/dashboard/:id/summary',
  dynamicRoute: (id) => `/dashboard/${id}/summary`,
  component: MineContainer,
};

export const CREATE_MINE_RECORD = {
  route: '/dashboard/create-mine',
  component: CreateMineForm,
};
