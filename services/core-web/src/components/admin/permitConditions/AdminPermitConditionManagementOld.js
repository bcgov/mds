import React, { Component } from "react";
import { Row, Col } from "antd";
import PropTypes from "prop-types";
import StandardPermitConditionsOld from "@/components/Forms/permits/conditions/StandardPermitConditionsOld";
import { AuthorizationGuard } from "@/HOC/AuthorizationGuard";
import * as Permission from "@/constants/permissions";
import PermitConditionsNavigation from "@/components/admin/permitConditions/PermitConditionsNavigation";

const propTypes = {
  location: PropTypes.shape({ pathname: PropTypes.string }).isRequired,
};

const defaultProps = {};

export class AdminPermitConditionManagementOld extends Component {
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
              <h1>Permit Conditions</h1>
            </Col>
          </Row>
        </div>
        <PermitConditionsNavigation
          activeButton={this.state.activeNavButton}
          openSubMenuKey={this.state.openSubMenuKey}
        />
        <div className="tab__content">
          <StandardPermitConditionsOld />
        </div>
      </div>
    );
  }
}

AdminPermitConditionManagementOld.propTypes = propTypes;
AdminPermitConditionManagementOld.defaultProps = defaultProps;

export default AuthorizationGuard(Permission.EDIT_TEMPLATE_PERMIT_CONDITIONS)(
  AdminPermitConditionManagementOld
);
