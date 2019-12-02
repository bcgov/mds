import React from "react";
import { Route, Switch } from "react-router-dom";
import * as routes from "@/constants/routes";
import PageNotFound from "@/components/common/PageNotFound";

const DashboardRoutes = () => (
  <Switch>
    <Route path={routes.MINE_SUMMARY.route} component={routes.MINE_SUMMARY.component} />
    {Object.values(routes).map((route) => (
      <Route exact path={route.route} component={route.component} />
    ))}
    <Route component={PageNotFound} />
  </Switch>
);

export default DashboardRoutes;
