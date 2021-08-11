/* eslint-disable */
import React, { Component } from "react";
import { Row, Col, Tabs } from "antd";
import PropTypes from "prop-types";
import { AuthorizationGuard } from "@/HOC/AuthorizationGuard";
import * as Permission from "@/constants/permissions";
import MergeContainer from "@/components/admin/contacts/MergeContainer";

/**
 * @class MergeContactsDashboard handles Merging Contacts
 */

const propTypes = {
  location: PropTypes.shape({ pathname: PropTypes.string }).isRequired,
};

export class MergeContactsDashboard extends Component {
  state = { activeTab: "PER" };

  componentWillMount() {}

  handleTabChange = (key) => {
    this.setState({
      activeTab: key,
    });
  };

  render() {
    return (
      <div>
        <div className="landing-page__header">
          <Row>
            <Col sm={22} md={14} lg={12}>
              <h1>Merge Contacts</h1>
            </Col>
          </Row>

          <Tabs
            activeKey={this.state.activeTab}
            size="large"
            animated={{ inkBar: false, tabPane: false }}
            onTabClick={this.handleTabChange}
            centered
          >
            <Tabs.TabPane tab="Merge Person" key="PER">
              <div className="tab__content">
                <MergeContainer partyType={this.state.activeTab} />
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane tab="Merge Companies" key="ORG">
              <div className="tab__content">
                <MergeContainer partyType={this.state.activeTab} />
              </div>
            </Tabs.TabPane>
          </Tabs>
        </div>
      </div>
    );
  }
}

MergeContactsDashboard.propTypes = propTypes;

export default AuthorizationGuard(Permission.VIEW_ADMIN_ROUTE)(MergeContactsDashboard);
