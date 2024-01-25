import React from "react";
import { Route, Switch } from "react-router-dom";
import * as routes from "@/constants/routes";
import PageNotFound from "@/components/common/PageNotFound";

const AdminDashboardRoutes = () => (
  <Switch>
    <Route
      exact
      path={routes.ADMIN_MANAGE_MINESPACE_USERS.route}
      component={routes.ADMIN_MANAGE_MINESPACE_USERS.component}
    />
    <Route
      exact
      path={routes.ADMIN_VERIFIED_MINES.route}
      component={routes.ADMIN_VERIFIED_MINES.component}
    />
    <Route component={PageNotFound} />
  </Switch>
);

export default AdminDashboardRoutes;
