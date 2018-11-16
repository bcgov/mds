import React from 'react';
import { Route, Switch } from 'react-router';
import RedirectRoute from './routeWrappers/RedirectRoute';
import * as routes from '@/constants/routes';
import * as String from '@/constants/strings';

const Routes = () => {
  return (
    <div>
      <Switch>
        <RedirectRoute 
          exact 
          path={routes.DASHBOARD.route} 
          redirectTo={routes.MINE_DASHBOARD.dynamicRoute(String.DEFAULT_PAGE, String.DEFAULT_PER_PAGE)} 
        />
        <Route path={routes.DASHBOARD.route} component={routes.DASHBOARD.component} />
        <Route render={() => <div>404 - Not Found</div>} />
      </Switch>
    </div>
  )
}

export default Routes
