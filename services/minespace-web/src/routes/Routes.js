import React from "react";
import { Link, Route, Switch } from "react-router-dom";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Result, Button, Typography } from "antd";
import AuthenticationGuard from "@/HOC/AuthenticationGuard";
import * as routes from "@/constants/routes";

const Routes = () => (
  <Switch>
    {/* PUBLIC ROUTES */}
    <Route exact path={routes.HOME.route} component={routes.HOME.component} />
    <Route exact path={routes.RETURN_PAGE.route} component={routes.RETURN_PAGE.component} />
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
    <Route
      path={routes.ADD_PROJECT_SUMMARY.route}
      component={AuthenticationGuard()(routes.ADD_PROJECT_SUMMARY.component)}
    />
    <Route
      path={routes.EDIT_PROJECT_SUMMARY.route}
      component={AuthenticationGuard()(routes.EDIT_PROJECT_SUMMARY.component)}
    />
    <Route
      path={routes.EDIT_PROJECT.route}
      component={AuthenticationGuard()(routes.EDIT_PROJECT.component)}
    />
    {/* 404 - PAGE NOT FOUND */}
    <Route
      render={() => (
        <Result
          title="Page Not Found"
          status="warning"
          subTitle={
            <Typography.Text>Sorry, the page you requested does not exist.</Typography.Text>
          }
          icon={<ExclamationCircleOutlined />}
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
