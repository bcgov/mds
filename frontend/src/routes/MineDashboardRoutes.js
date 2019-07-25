import React from "react";
import { Route, Switch } from "react-router-dom";
import * as routes from "@/constants/routes";
import PageNotFound from "@/components/common/PageNotFound";

const MineDashboardRoutes = () => (
  <Switch>
    <Route exact path={routes.MINE_CONTACTS.route} component={routes.MINE_CONTACTS.component} />
    <Route exact path={routes.MINE_GENERAL.route} component={routes.MINE_GENERAL.component} />
    <Route
      exact
      path={routes.MINE_PERMIT_APPLICATIONS.route}
      component={routes.MINE_PERMIT_APPLICATIONS.component}
    />
    <Route exact path={routes.MINE_PERMITS.route} component={routes.MINE_PERMITS.component} />
    <Route component={PageNotFound} />
  </Switch>
);

export default MineDashboardRoutes;
