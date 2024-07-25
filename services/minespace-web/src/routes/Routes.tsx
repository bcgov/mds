import { Button, Result, Typography } from "antd";
import { Link, Route, Switch } from "react-router-dom";

import ExclamationCircleOutlined from "@ant-design/icons/ExclamationCircleOutlined";
import React, { Suspense } from "react";
import AuthenticationGuard from "@/HOC/AuthenticationGuard";
import * as routes from "@/constants/routes";
import Loading from "@/components/common/Loading";
import ColumnWrapper from "@/HOC/ColumnWrapper";

const Routes = () => (
  <Suspense fallback={<Loading></Loading>}>
    <Switch>
      {/* PUBLIC ROUTES */}
      <Route exact path={routes.HOME.route} component={ColumnWrapper()(routes.HOME.component)} />
      <Route
        exact
        path={routes.RETURN_PAGE.route}
        component={ColumnWrapper()(routes.RETURN_PAGE.component)}
      />
      {/* PRIVATE ROUTES */}
      <Route
        exact
        path={routes.MINES.route}
        component={ColumnWrapper()(AuthenticationGuard()(routes.MINES.component))}
      />
      <Route
        exact
        path={routes.USERS.route}
        component={ColumnWrapper()(AuthenticationGuard()(routes.USERS.component))}
      />
      <Route
        exact
        path={routes.MINE_DASHBOARD.route}
        component={AuthenticationGuard()(routes.MINE_DASHBOARD.component)}
      />
      <Route
        exact
        path={routes.MAJOR_MINE_APPLICATION_SUCCESS.route}
        component={ColumnWrapper()(
          AuthenticationGuard()(routes.MAJOR_MINE_APPLICATION_SUCCESS.component)
        )}
      />
      <Route
        exact
        path={routes.REVIEW_MAJOR_MINE_APPLICATION.route}
        component={ColumnWrapper()(
          AuthenticationGuard()(routes.REVIEW_MAJOR_MINE_APPLICATION.component)
        )}
      />
      <Route
        exact
        path={routes.EDIT_MAJOR_MINE_APPLICATION.route}
        component={ColumnWrapper()(
          AuthenticationGuard()(routes.EDIT_MAJOR_MINE_APPLICATION.component)
        )}
      />
      <Route
        exact
        path={routes.ADD_MAJOR_MINE_APPLICATION.route}
        component={ColumnWrapper()(
          AuthenticationGuard()(routes.ADD_MAJOR_MINE_APPLICATION.component)
        )}
      />
      <Route
        exact
        path={routes.MINE_INCIDENT_SUCCESS.route}
        component={ColumnWrapper()(AuthenticationGuard()(routes.MINE_INCIDENT_SUCCESS.component))}
      />
      <Route
        exact
        path={routes.REVIEW_MINE_INCIDENT.route}
        component={ColumnWrapper()(AuthenticationGuard()(routes.REVIEW_MINE_INCIDENT.component))}
      />
      <Route
        exact
        path={routes.VIEW_PROJECT_SUBMISSION_STATUS_PAGE.route}
        component={ColumnWrapper()(
          AuthenticationGuard()(routes.VIEW_PROJECT_SUBMISSION_STATUS_PAGE.component)
        )}
      />
      <Route
        path={routes.ADD_PROJECT_SUMMARY.route}
        component={ColumnWrapper()(AuthenticationGuard()(routes.ADD_PROJECT_SUMMARY.component))}
      />
      <Route
        path={routes.EDIT_PROJECT_SUMMARY.route}
        component={ColumnWrapper()(AuthenticationGuard()(routes.EDIT_PROJECT_SUMMARY.component))}
      />
      <Route
        path={routes.ADD_INFORMATION_REQUIREMENTS_TABLE.route}
        component={ColumnWrapper()(
          AuthenticationGuard()(routes.ADD_INFORMATION_REQUIREMENTS_TABLE.component)
        )}
      />
      <Route
        path={routes.RESUBMIT_INFORMATION_REQUIREMENTS_TABLE.route}
        component={ColumnWrapper()(
          AuthenticationGuard()(routes.RESUBMIT_INFORMATION_REQUIREMENTS_TABLE.component)
        )}
      />
      <Route
        path={routes.REVIEW_INFORMATION_REQUIREMENTS_TABLE.route}
        component={ColumnWrapper()(
          AuthenticationGuard()(routes.REVIEW_INFORMATION_REQUIREMENTS_TABLE.component)
        )}
      />
      <Route
        path={routes.INFORMATION_REQUIREMENTS_TABLE_SUCCESS.route}
        component={ColumnWrapper()(
          AuthenticationGuard()(routes.INFORMATION_REQUIREMENTS_TABLE_SUCCESS.component)
        )}
      />
      <Route
        path={routes.EDIT_PROJECT.route}
        component={AuthenticationGuard()(routes.EDIT_PROJECT.component)}
      />
      <Route
        path={routes.ADD_TAILINGS_STORAGE_FACILITY.route}
        component={ColumnWrapper()(
          AuthenticationGuard()(routes.ADD_TAILINGS_STORAGE_FACILITY.component)
        )}
      />
      <Route
        path={routes.EDIT_TAILINGS_STORAGE_FACILITY.route}
        component={ColumnWrapper()(
          AuthenticationGuard()(routes.EDIT_TAILINGS_STORAGE_FACILITY.component)
        )}
      />
      <Route
        path={routes.ADD_DAM.route}
        component={ColumnWrapper()(AuthenticationGuard()(routes.ADD_DAM.component))}
      />
      <Route
        path={routes.EDIT_DAM.route}
        component={ColumnWrapper()(AuthenticationGuard()(routes.EDIT_DAM.component))}
      />
      <Route
        path={routes.ADD_MINE_INCIDENT.route}
        component={ColumnWrapper()(AuthenticationGuard()(routes.ADD_MINE_INCIDENT.component))}
      />
      <Route
        path={routes.EDIT_MINE_INCIDENT.route}
        component={ColumnWrapper()(AuthenticationGuard()(routes.EDIT_MINE_INCIDENT.component))}
      />
      <Route
        path={routes.VIEW_ESUP.route}
        component={ColumnWrapper()(AuthenticationGuard()(routes.VIEW_ESUP.component))}
      />
      <Route
        path={routes.REPORTS_CREATE_NEW.route}
        component={ColumnWrapper()(AuthenticationGuard()(routes.REPORTS_CREATE_NEW.component))}
      />
      <Route
        path={routes.REPORT_VIEW_EDIT.route}
        component={ColumnWrapper()(AuthenticationGuard()(routes.REPORT_VIEW_EDIT.component))}
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
  </Suspense>
);

export default Routes;
