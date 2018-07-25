import React from 'react';
import { Route, Switch } from 'react-router';
import * as routes from './constants/routes';

import Home from './components/Home';
import MineDashboard from './components/mine/MineDashboard';
import CreateMineForm from './components/mine/CreateMineForm';

const Routes = (props) => {
  return (
    <div>
      <Switch>
        <Route exact path={routes.HOME} component={Home} />
        <Route exact path={routes.MINE_DASHBOARD} component={MineDashboard} />
        <Route exact path={routes.CREATE_MINE_RECORD} component={CreateMineForm} />
        <Route render={(props) => <div>404 - Not Found</div>} />
      </Switch>
    </div>
  )
}

export default Routes
