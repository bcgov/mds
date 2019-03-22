import React, { Component } from "react";
import { Input, Button, Row, Col } from "antd";
import { compose, bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import * as router from "@/constants/routes";
import { Link } from "react-router-dom";

import { AuthorizationGuard } from "@/HOC/AuthorizationGuard";
import * as Permission from "@/constants/permissions";
import MinespaceUserManagement from "@/components/admin/MinespaceUserManagement";
import { downloadMineManagerHistory } from "@/actionCreators/partiesActionCreator";
import { AdminVerifiedMinesList } from "@/components/admin/AdminVerifiedMinesList";

import { fetchMineVerifiedStatus } from "@/actionCreators/mineActionCreator";
import { getHealthyMines, getUnhealthyMines } from "@/reducers/mineReducer";

/**
 * @class AdminDashboard houses everything related to admin tasks, this is a permission-based route.
 */

const propTypes = {
  unhealthyMines: PropTypes.arrayOf(CustomPropTypes.mineVerificationStatus),
  healthyMines: PropTypes.arrayOf(CustomPropTypes.mineVerificationStatus),
  fetchMineVerifiedStatus: PropTypes.func.isRequired,
};

const defaultProps = {
  unhealthyMines: [],
  healthyMines: [],
};

export class AdminDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mineNo: "",
    };
  }

  componentWillMount() {
    this.props.fetchMineVerifiedStatus();
  }

  handleChange = (e) => {
    this.setState({
      mineNo: e.target.value,
    });
  };

  handleDownload = () => {
    downloadMineManagerHistory(this.state.mineNo, { window, document });
  };

  compareMineName = (a, b) => {
    if (a.mine_name < b.mine_name) {
      return -1;
    }
    if (a.mine_name > b.mine_name) {
      return 1;
    }
    return 0;
  };

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
          <div className="tab__content">
            <div className="inline-flex evenly">
              <div>
                <h4>{this.props.healthyMines.length}&nbsp;Verified Mines</h4>
                <div>
                  {this.props.healthyMines.length > 0 && (
                    <AdminVerifiedMinesList
                      minesVerifiedStatusList={this.props.healthyMines.sort(this.compareMineName)}
                    />
                  )}
                </div>
              </div>
              <div>
                <h4>{this.props.unhealthyMines.length}&nbsp;Mines Needing Re-Verification</h4>
                <div>
                  {this.props.unhealthyMines.length > 0 && (
                    <AdminVerifiedMinesList
                      minesVerifiedStatusList={this.props.unhealthyMines.sort(this.compareMineName)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="tab__content">
            <h2>Pull Mine Manager History</h2>
            <Input
              placeholder="Enter a Mine Number"
              value={this.state.mineNo}
              onChange={this.handleChange}
              style={{ width: "50%", "max-width": "300px" }}
            />
            <Button onClick={this.handleDownload}>Download History</Button>
          </div>
          <div className="tab__content">
            <MinespaceUserManagement />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  unhealthyMines: getUnhealthyMines(state),
  healthyMines: getHealthyMines(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineVerifiedStatus,
    },
    dispatch
  );

AdminDashboard.propTypes = propTypes;
AdminDashboard.defaultProps = defaultProps;

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  AuthorizationGuard(Permission.ADMIN) // isPublic === true
)(AdminDashboard);
