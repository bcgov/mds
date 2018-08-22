import React from 'react';
import { Route, Switch, Router } from 'react-router';
import RedirectRoute from './routeWrappers/RedirectRoute';
import * as routes from '@/constants/routes';

const Routes = (props) => {
  return (
    <div>
      <Switch>
        <Router basename={'dev-pr-62'}>
        <RedirectRoute exact path={routes.DASHBOARD.route} redirectTo={routes.MINE_DASHBOARD.route} />
        <Route path={routes.DASHBOARD.route} component={routes.DASHBOARD.component} />
        <Route render={(props) => <div>404 - Not Found</div>} />
        </Router>
      </Switch>
    </div>
  )
}

export default Routes
