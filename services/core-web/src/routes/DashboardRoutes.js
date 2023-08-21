import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import * as routes from "@/constants/routes";
import PageNotFound from "@/components/common/PageNotFound";

const DashboardRoutes = () => {
  const exportedRoutes = Object.values(routes).filter((r) => r.route && r.component);

  return (
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
        render={() => <Redirect to={routes.ADMIN_VERIFIED_MINES.dynamicRoute("verified")} />}
      />
      <Route path={routes.ADMIN_DASHBOARD.route} component={routes.ADMIN_DASHBOARD.component} />

      {exportedRoutes.map(({ route, component }) => (
        <Route exact path={route} component={component} key={route} />
      ))}
      <Route component={PageNotFound} />
    </Switch>
  );
};

export default DashboardRoutes;
