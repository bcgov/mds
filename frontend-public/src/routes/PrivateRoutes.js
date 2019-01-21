import React from "react";
import { Route, Switch } from "react-router-dom";
import * as routes from "@/constants/routes";
import AuthenticationGuard from "@/HOC/AuthenticationGuard";

const PrivateRoutes = () => (
  <div>
    <Switch>
      <Route
        exact
        path={routes.DASHBOARD.route}
        component={AuthenticationGuard(routes.DASHBOARD.component)}
      />
      <Route
        exact
        path={routes.MINE_INFO.route}
        component={AuthenticationGuard(routes.MINE_INFO.component)}
      />
    </Switch>
  </div>
);

export default PrivateRoutes;
