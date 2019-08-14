import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import * as routes from "@/constants/routes";
import PageNotFound from "@/components/common/PageNotFound";

const DashboardRoutes = () => (
  <Switch>
    <Route exact path={routes.HOME_PAGE.route} component={routes.HOME_PAGE.component} />
    <Route
      exact
      path={routes.CUSTOM_HOME_PAGE.route}
      component={routes.CUSTOM_HOME_PAGE.component}
    />
    <Route exact path={routes.MINE_HOME_PAGE.route} component={routes.MINE_HOME_PAGE.component} />
    <Route
      exact
      path={routes.CONTACT_HOME_PAGE.route}
      component={routes.CONTACT_HOME_PAGE.component}
    />
    <Route
      exact
      path={routes.MINE_SUMMARY.route}
      render={({ match }) => <Redirect to={routes.MINE_GENERAL.dynamicRoute(match.params.id)} />}
    />
    <Route path={routes.MINE_SUMMARY.route} component={routes.MINE_SUMMARY.component} />

    <Route exact path={routes.PARTY_PROFILE.route} component={routes.PARTY_PROFILE.component} />
    <Route
      exact
      path={routes.RELATIONSHIP_PROFILE.route}
      component={routes.RELATIONSHIP_PROFILE.component}
    />
    <Route exact path={routes.ADMIN_DASHBOARD.route} component={routes.ADMIN_DASHBOARD.component} />
    <Route exact path={routes.SEARCH_RESULTS.route} component={routes.SEARCH_RESULTS.component} />
    <Route
      exact
      path={routes.REPORTING_DASHBOARD.route}
      component={routes.REPORTING_DASHBOARD.component}
    />
    <Route
      exact
      path={routes.EXECUTIVE_REPORTING_DASHBOARD.route}
      component={routes.EXECUTIVE_REPORTING_DASHBOARD.component}
    />
    <Route
      exact
      path={routes.VARIANCE_DASHBOARD.route}
      component={routes.VARIANCE_DASHBOARD.component}
    />
    <Route
      exact
      path={routes.NOTICE_OF_WORK_APPLICATION.route}
      component={routes.NOTICE_OF_WORK_APPLICATION.component}
    />
    <Route component={PageNotFound} />
  </Switch>
);

export default DashboardRoutes;
