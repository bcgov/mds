import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';

import * as routes from '@/constants/routes';

const DashboardRoutes = () => {
  return (
    <Switch>
        <Route exact path={routes.MINE_DASHBOARD.route} component={routes.MINE_DASHBOARD.component} />
        <Route exact path={routes.CREATE_MINE_RECORD.route} component={routes.CREATE_MINE_RECORD.component} />
        <Route exact path={routes.MINE_SUMMARY.route} component={routes.MINE_SUMMARY.component} />
    </Switch>
  )
};

export default DashboardRoutes;
