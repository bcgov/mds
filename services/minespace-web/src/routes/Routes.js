import React from "react";
import { Link, Redirect, Route, Switch } from "react-router-dom";
import { Result, Button, Icon, Typography } from "antd";
import AuthenticationGuard from "@/HOC/AuthenticationGuard";
import * as routes from "@/constants/routes";

const { Text } = Typography;

const Routes = () => (
  <Switch>
    {/* PUBLIC ROUTES */}
    <Route exact path={routes.HOME.route} component={routes.HOME.component} />
    <Route exact path={routes.RETURN_PAGE.route} component={routes.RETURN_PAGE.component} /> */}
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
    <Route
      exact
      path={routes.MINE_DASHBOARD.route}
      component={AuthenticationGuard()(routes.MINE_DASHBOARD.component)}
    />
    {/* 404 - PAGE NOT FOUND */}
    <Route
      render={() => (
        <Result
          title="Page Not Found"
          status="warning"
          subTitle={<Text>Sorry, the page you requested does not exist.</Text>}
          icon={<Icon type="exclamation-circle" />}
          extra={
            <Link to={routes.HOME.route}>
              <Button>Home</Button>
            </Link>
          }
        />
      )}
    />
  </Switch>
);

export default Routes;
