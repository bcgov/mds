import React, { Component } from "react";
import { Row, Col, Tabs } from "antd";
import { compose, bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { fetchMineVerifiedStatuses } from "@common/actionCreators/mineActionCreator";
import { AuthorizationGuard } from "@/HOC/AuthorizationGuard";
import * as Permission from "@/constants/permissions";
import MinespaceUserManagement from "@/components/admin/MinespaceUserManagement";
import { AdminVerifiedMinesList } from "@/components/admin/AdminVerifiedMinesList";

/**
 * @class AdminDashboard houses everything related to admin tasks, this is a permission-based route.
 */

const { TabPane } = Tabs;

const propTypes = {
  fetchMineVerifiedStatuses: PropTypes.func.isRequired,
};

export class AdminDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: "verifiedMines",
      isLoaded: false,
      verifiedMines: [],
      unverifiedMines: [],
    };
  }

  componentWillMount() {
    this.props.fetchMineVerifiedStatuses().then((response) => {
      this.setState({
        isLoaded: true,
        verifiedMines: response.data
          .filter((vm) => vm.healthy_ind === true)
          .sort(this.compareMineName),
        unverifiedMines: response.data
          .filter((vm) => vm.healthy_ind === false)
          .sort(this.compareMineName),
      });
    });
  }

  handleTabChange = (activeTab) => {
    this.setState({
      activeTab,
    });
  };

  compareMineName = (a, b) => a.mine_name.localeCompare(b.mine_name);

  render() {
    return (
      <div className="landing-page">
        <div className="landing-page__header">
          <Row>
            <Col sm={22} md={14} lg={12}>
              <h1>Admin View</h1>
            </Col>
          </Row>
        </div>
        <div className="landing-page__content">
          <Tabs
            className="center-tabs"
            activeKey={this.state.activeTab}
            defaultActiveKey="summary"
            onChange={this.handleTabChange}
            size="large"
            animated={{ inkBar: true, tabPane: false }}
          >
            <TabPane tab="Verified Mines" key="verifiedMines">
              <div className="tab__content">
                <div>
                  <h4>{this.state.verifiedMines.length}&nbsp;Verified Mines</h4>
                  <div>
                    <AdminVerifiedMinesList
                      isLoaded={this.state.isLoaded}
                      minesVerifiedStatusList={this.state.verifiedMines}
                    />
                  </div>
                </div>
              </div>
            </TabPane>
            <TabPane tab="Unverified Mines" key="unverifiedMines">
              <div className="tab__content">
                <div>
                  <h4>{this.state.unverifiedMines.length}&nbsp;Mines Needing Re-Verification</h4>
                  <div>
                    <AdminVerifiedMinesList
                      isLoaded={this.state.isLoaded}
                      minesVerifiedStatusList={this.state.unverifiedMines}
                    />
                  </div>
                </div>
              </div>
            </TabPane>
            <TabPane tab="Manage MineSpace Users" key="managerMinespaceUsers">
              <div className="tab__content">
                <MinespaceUserManagement />
              </div>
            </TabPane>
          </Tabs>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineVerifiedStatuses,
    },
    dispatch
  );

AdminDashboard.propTypes = propTypes;

export default compose(
  connect(null, mapDispatchToProps),
  AuthorizationGuard(Permission.ADMIN)
)(AdminDashboard);
