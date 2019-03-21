import React, { Component } from "react";
import { Input, Button } from "antd";
import { compose, bindActionCreators } from "redux";
import { connect } from "react-redux";
import { AuthorizationGuard } from "@/HOC/AuthorizationGuard";
import * as Permission from "@/constants/permissions";
import MinespaceUserManagement from "@/components/admin/MinespaceUserManagement";
import { downloadMineManagerHistory } from "@/actionCreators/partiesActionCreator";

import { fetchMineVerifiedStatus } from "@/actionCreators/mineActionCreator";
import { getHealthyMines, getUnhealthyMines } from "@/reducers/mineReducer";
/**
 * @class AdminDashboard houses everything related to admin tasks, this is a permission-based route.
 */

const propTypes = {
  unhealthyMines: PropTypes.array,
  healthyMines: PropTypes.array,
};

export class AdminDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mineNo: "",
    };
  }

  handleChange = (e) => {
    this.setState({
      mineNo: e.target.value,
    });
  };

  handleDownload = () => {
    downloadMineManagerHistory(this.state.mineNo, { window, document });
  };

  render() {
    return (
      <div className="landing-page">
        <div className="landing-page__header">
          <h1>Admin View</h1>
        </div>
        <div className="landing-page__content">
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

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  AuthorizationGuard(Permission.ADMIN) // isPublic === true
)(AdminDashboard);
