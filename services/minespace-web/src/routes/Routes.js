import React from "react";
import { Route, Switch } from "react-router-dom";
import * as routes from "@/constants/routes";
import AuthenticationGuard from "@/HOC/AuthenticationGuard";
import NullScreen from "@/components/common/NullScreen";

const Routes = () => (
  <div>
    <Switch>
      {/* PUBLIC ROUTES */}
      <Route exact path={routes.HOME.route} component={routes.HOME.component} />
      <Route exact path={routes.RETURN_PAGE.route} component={routes.RETURN_PAGE.component} />
      <Route exact path={routes.MOCKUP.route} component={routes.MOCKUP.component} />

      {/* PRIVATE ROUTES */}
      <Route
        exact
        path={routes.DASHBOARD.route}
        component={AuthenticationGuard()(routes.DASHBOARD.component)}
      />
      <Route
        exact
        path={routes.MINE_DASHBOARD.route}
        component={AuthenticationGuard()(routes.MINE_DASHBOARD.component)}
      />
      <Route
        exact
        path={routes.VARIANCES.route}
        component={AuthenticationGuard()(routes.VARIANCES.component)}
      />
      <Route
        exact
        path={routes.REPORTS.route}
        component={AuthenticationGuard()(routes.REPORTS.component)}
      />

      {/* 404 - ROUTE NOT FOUND */}
      <Route render={() => <NullScreen type="404" />} />
    </Switch>
  </div>
);

export default Routes;
