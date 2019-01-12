import React from "react";
import { Route, Switch } from "react-router-dom";
import * as routes from "@/constants/routes";

const AdminDashboardRoutes = () => (
  <Switch>
    <Route exact path={routes.ADMIN_DASHBOARD.route} component={routes.ADMIN_DASHBOARD.component} />
  </Switch>
);

export default AdminDashboardRoutes;
