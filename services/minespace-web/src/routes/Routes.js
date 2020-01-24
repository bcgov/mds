import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
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
        path={routes.MINES.route}
        component={AuthenticationGuard()(routes.MINES.component)}
      />
      <Route
        exact
        path={routes.USERS.route}
        component={AuthenticationGuard()(routes.USERS.component)}
      />
      <Redirect
        exact
        from={routes.MINE_DASHBOARD_NO_TAB.route}
        to={routes.MINE_DASHBOARD.dynamicRoute(":id")}
      />
      <Route
        exact
        path={routes.MINE_DASHBOARD.route}
        component={AuthenticationGuard()(routes.MINE_DASHBOARD.component)}
      />

      {/* 404 - ROUTE NOT FOUND */}
      <Route render={() => <NullScreen type="404" />} />
    </Switch>
  </div>
);

export default Routes;
