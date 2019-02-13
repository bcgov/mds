import React from "react";
import { Route, Switch } from "react-router-dom";
import * as routes from "@/constants/routes";
import PageNotFound from "@/components/common/PageNotFound";

const DashboardRoutes = () => (
  <Switch>
    <Route exact path={routes.MINE_DASHBOARD.route} component={routes.MINE_DASHBOARD.component} />
    <Route exact path={routes.MINE_SUMMARY.route} component={routes.MINE_SUMMARY.component} />
    <Route exact path={routes.PARTY_PROFILE.route} component={routes.PARTY_PROFILE.component} />
    <Route
      exact
      path={routes.RELATIONSHIP_PROFILE.route}
      component={routes.RELATIONSHIP_PROFILE.component}
    />
    <Route exact path={routes.ADMIN_DASHBOARD.route} component={routes.ADMIN_DASHBOARD.component} />
    <Route component={PageNotFound} />
  </Switch>
);

export default DashboardRoutes;
