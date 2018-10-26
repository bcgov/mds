// internal URL's
import Home from '@/components/Home';
import Dashboard from '@/components/dashboard/Dashboard';
import MineDashboard from '@/components/mine/MineDashboard';
import PartyProfile from '@/components/parties/PartyProfile';

export const DASHBOARD = {
    route: '/',
    component: Home,
};

export const MINE_DASHBOARD = {
  route: '/dashboard',
  dynamicRoute: (page, per_page) => `/dashboard?page=${page}&per_page=${per_page}`,
  relativeRoute: (page, per_page) => `/dashboard?page=${page}&per_page=${per_page}&map=true`,
  component: Dashboard,
};

export const MINE_SUMMARY = {
  route: '/dashboard/:id/summary/:activeTab',
  dynamicRoute: (id, activeTab="summary") => `/dashboard/${id}/summary/${activeTab}`,
  component: MineDashboard,
};

export const PARTY_PROFILE = {
  route: '/dashboard/profile/:id',
  dynamicRoute: (id) => `/dashboard/profile/${id}`,
  component: PartyProfile,
};

