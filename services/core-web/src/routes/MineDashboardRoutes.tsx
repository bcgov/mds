import React, { FC } from "react";
import { Route, Switch } from "react-router-dom";
import * as routes from "@/constants/routes";
import PageNotFound from "@/components/common/PageNotFound";

const MineDashboardRoutes: FC = () => (
  <Switch>
    <Route exact path={routes.MINE_CONTACTS.route} component={routes.MINE_CONTACTS.component} />
    <Route exact path={routes.MINE_GENERAL.route} component={routes.MINE_GENERAL.component} />
    <Route exact path={routes.MINE_ACCESS.route} component={routes.MINE_ACCESS.component} />
    <Route exact path={routes.MINE_DOCUMENTS.route} component={routes.MINE_DOCUMENTS.component} />
    <Route
      exact
      path={routes.MINE_PERMIT_DIGITAL_CREDENTIALS.route}
      component={routes.MINE_PERMIT_DIGITAL_CREDENTIALS.component}
    />
    <Route exact path={routes.MINE_SECURITIES.route} component={routes.MINE_SECURITIES.component} />
    <Route exact path={routes.MINE_VARIANCES.route} component={routes.MINE_VARIANCES.component} />
    <Route
      exact
      path={routes.MINE_NOTICES_OF_DEPARTURE.route}
      component={routes.MINE_NOTICES_OF_DEPARTURE.component}
    />
    <Route
      exact
      path={routes.MINE_PRE_APPLICATIONS.route}
      component={routes.MINE_PRE_APPLICATIONS.component}
    />
    <Route
      exact
      path={routes.EDIT_PROJECT_SUMMARY.route}
      component={routes.EDIT_PROJECT_SUMMARY.component}
    />
    <Route
      exact
      path={routes.ADD_PROJECT_SUMMARY.route}
      component={routes.ADD_PROJECT_SUMMARY.component}
    />
    <Route exact path={routes.EDIT_PROJECT.route} component={routes.EDIT_PROJECT.component} />
    <Route
      exact
      path={routes.MINE_NOW_APPLICATIONS.route}
      component={routes.MINE_NOW_APPLICATIONS.component}
    />

    <Route exact path={routes.MINE_INCIDENTS.route} component={routes.MINE_INCIDENTS.component} />
    <Route
      exact
      path={routes.MINE_INSPECTIONS.route}
      component={routes.MINE_INSPECTIONS.component}
    />
    <Route exact path={routes.MINE_REPORTS.route} component={routes.MINE_REPORTS.component} />
    <Route
      exact
      path={routes.MINE_TAILINGS_REPORTS.route}
      component={routes.MINE_TAILINGS_REPORTS.component}
    />
    <Route exact path={routes.MINE_TAILINGS.route} component={routes.MINE_TAILINGS.component} />
    <Route
      exact
      path={routes.MINE_TAILINGS_DETAILS.route}
      component={routes.MINE_TAILINGS_DETAILS.component}
    />
    <Route
      exact
      path={routes.EDIT_TAILINGS_STORAGE_FACILITY.route}
      component={routes.EDIT_TAILINGS_STORAGE_FACILITY.component}
    />
    <Route
      exact
      path={routes.ADD_TAILINGS_STORAGE_FACILITY.route}
      component={routes.ADD_TAILINGS_STORAGE_FACILITY.component}
    />
    <Route exact path={routes.ADD_DAM.route} component={routes.ADD_DAM.component} />
    <Route exact path={routes.EDIT_DAM.route} component={routes.EDIT_DAM.component} />
    <Route exact path={routes.MINE_DOCUMENTS.route} component={routes.MINE_DOCUMENTS.component} />
    <Route
      exact
      path={routes.MINE_EXTERNAL_AUTHORIZATIONS.route}
      component={routes.MINE_EXTERNAL_AUTHORIZATIONS.component}
    />
    <Route component={PageNotFound} />
  </Switch>
);

export default MineDashboardRoutes;
