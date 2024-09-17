import React, { Component } from "react";
import { Row, Col } from "antd";
import PropTypes from "prop-types";
import { AuthorizationGuard } from "@/HOC/AuthorizationGuard";
import * as Permission from "@mds/common/constants/permissions";
import AdminNavigation from "@/components/admin/AdminNavigation";
import AdminDashboardRoutes from "@/routes/AdminDashboardRoutes";

/**
 * @class AdminDashboard houses everything related to admin tasks, this is a permission-based route.
 */

const propTypes = {
  location: PropTypes.shape({ pathname: PropTypes.string }).isRequired,
};

export class AdminDashboard extends Component {
  state = {
    activeNavButton: "permit-conditions",
    openSubMenuKey: ["SAG"],
  };

  componentWillMount() {
    this.handleActiveButton(this.props.location.pathname);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.location !== nextProps.location) {
      this.handleActiveButton(nextProps.location.pathname);
    }
  }

  handleActiveButton = (path) => {
    const lastPath = path.split("/").pop();
    this.setState({ activeNavButton: path, openSubMenuKey: [lastPath] });
  };

  render() {
    return (
      <div>
        <div className="landing-page__header">
          <Row>
            <Col sm={22} md={14} lg={12}>
              <h1>Administrative Dashboard</h1>
            </Col>
          </Row>
        </div>
        <AdminNavigation
          activeButton={this.state.activeNavButton}
          openSubMenuKey={this.state.openSubMenuKey}
        />
        <AdminDashboardRoutes />
      </div>
    );
  }
}

AdminDashboard.propTypes = propTypes;

export default AuthorizationGuard(Permission.ADMIN)(AdminDashboard);
