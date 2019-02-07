import React from "react";
import { Route, Switch } from "react-router-dom";
import RedirectRoute from "./routeWrappers/RedirectRoute";
import * as routes from "@/constants/routes";
import * as Strings from "@/constants/strings";

const Routes = () => (
  <div>
    <Switch>
      <RedirectRoute
        exact
        path={routes.DASHBOARD.route}
        redirectTo={routes.MINE_DASHBOARD.dynamicRoute({
          page: Strings.DEFAULT_PAGE,
          per_page: Strings.DEFAULT_PER_PAGE,
        })}
      />
      <Route path={routes.DASHBOARD.route} component={routes.DASHBOARD.component} />
    </Switch>
  </div>
);

export default Routes;
