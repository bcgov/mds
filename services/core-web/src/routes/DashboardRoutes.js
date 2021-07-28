/* eslint-disable */
import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import * as routes from "@/constants/routes";
import PageNotFound from "@/components/common/PageNotFound";

const DashboardRoutes = () => (
  <Switch>
    <Route
      exact
      path={routes.MINE_SUMMARY.route}
      render={({ match }) => <Redirect to={routes.MINE_GENERAL.dynamicRoute(match.params.id)} />}
    />
    <Route path={routes.MINE_SUMMARY.route} component={routes.MINE_SUMMARY.component} />
    <Route
      exact
      path={routes.ADMIN_DASHBOARD.route}
      render={({ match }) => <Redirect to={routes.ADMIN_PERMIT_CONDITION.dynamicRoute("SAG")} />}
    />
    <Route path={routes.ADMIN_DASHBOARD.route} component={routes.ADMIN_DASHBOARD.component} />
    {Object.values(routes).map((route) => (
      <Route exact path={route.route} component={route.component} />
    ))}
    <Route component={PageNotFound} />
  </Switch>
);

export default DashboardRoutes;
