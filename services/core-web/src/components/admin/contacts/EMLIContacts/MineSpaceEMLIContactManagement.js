import React, { Component } from "react";
import { Row, Col } from "antd";
import PropTypes from "prop-types";
import StandardPermitConditions from "@/components/Forms/permits/conditions/StandardPermitConditions";
import { AuthorizationGuard } from "@/HOC/AuthorizationGuard";
import * as Permission from "@/constants/permissions";
import EMLIContactsTable from "@/components/admin/contacts/EMLIContacts/EMLIContactsTable";

const propTypes = {
  location: PropTypes.shape({ pathname: PropTypes.string }).isRequired,
};

const defaultProps = {};

export class MineSpaceEMLIContactManagement extends Component {
  state = { isLoaded: true };

  componentWillMount() {
    console.log("fetch data");
  }

  render() {
    return (
      <div>
        <div className="landing-page__header">
          <Row>
            <Col sm={22} md={14} lg={12}>
              <h1>MineSpace EMLI Contact Management</h1>
            </Col>
          </Row>
        </div>
        <div className="tab__content">
          <EMLIContactsTable isLoaded={this.state.isLoaded} />
        </div>
      </div>
    );
  }
}

MineSpaceEMLIContactManagement.propTypes = propTypes;
MineSpaceEMLIContactManagement.defaultProps = defaultProps;

export default AuthorizationGuard(Permission.EDIT_TEMPLATE_PERMIT_CONDITIONS)(
  MineSpaceEMLIContactManagement
);
