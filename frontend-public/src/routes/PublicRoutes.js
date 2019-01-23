import React from "react";
import { Route, Switch } from "react-router-dom";
import * as routes from "@/constants/routes";

const PublicRoutes = () => (
  <div>
    <Switch>
      <Route exact path={routes.HOME.route} component={routes.HOME.component} />
    </Switch>
  </div>
);

export default PublicRoutes;
