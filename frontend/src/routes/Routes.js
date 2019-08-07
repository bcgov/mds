import React from "react";
import { Route, Switch } from "react-router-dom";
import RedirectRoute from "./routeWrappers/RedirectRoute";
import * as routes from "@/constants/routes";

const Routes = () => (
  <div>
    <Switch>
      <RedirectRoute exact path={routes.DASHBOARD.route} redirectTo={routes.HOME_PAGE.route} />
      <Route path={routes.DASHBOARD.route} component={routes.DASHBOARD.component} />
      <Route exact path={routes.LOGOUT.route} component={routes.LOGOUT.component} />
    </Switch>
  </div>
);

export default Routes;
