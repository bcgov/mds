import React from 'react';
import { Route, Switch } from 'react-router';
import * as routes from '@/constants/routes';

const Routes = (props) => {
  return (
    <div>
      <Switch>
        <Route path={routes.DASHBOARD.route} component={routes.DASHBOARD.component} />
        <Route exact path={routes.HOME.route} component={routes.HOME.component} />
        <Route render={(props) => <div>404 - Not Found</div>} />
      </Switch>
    </div>
  )
}

export default Routes
