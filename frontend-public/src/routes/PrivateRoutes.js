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
    </Switch>
  </div>
);

export default PrivateRoutes;
