import React from "react";
import { Route, Switch } from "react-router-dom";
import * as routes from "@/constants/routes";

const Routes = () => (
  <div>
    <Switch>
      <Route path={routes.HOME.route} component={routes.HOME.component} />
      <Route render={() => <div>404 - Not Found</div>} />
    </Switch>
  </div>
);

export default Routes;
