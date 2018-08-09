import React from 'react';
import { Route, Switch } from 'react-router';
import RedirectRoute from './routeWrappers/RedirectRoute';
import * as routes from '@/constants/routes';

const Routes = (props) => {
  return (
    <div>
      <Switch>
        {/* <RedirectRoute exact path={routes.DASHBOARD.route} redirectTo={routes.MINE_DASHBOARD.route} /> */}
        
        <Route path={routes.DASHBOARD.route} component={routes.DASHBOARD.component} />
        <Route render={(props) => <div>404 - Not Found</div>} />
      </Switch>
    </div>
  )
}

export default Routes
