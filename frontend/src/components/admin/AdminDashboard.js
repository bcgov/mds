import React, { Component } from "react";
import { Input, Button } from "antd";
import { AuthorizationGuard } from "@/HOC/AuthorizationGuard";
import * as Permission from "@/constants/permissions";
import { downloadMineManagerHistory } from "@/actionCreators/partiesActionCreator";

/**
 * @class AdminDashboard houses everything related to admin tasks, this is a permission-based route.
 */

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
        <div className="landing-page__header" />
        <div className="landing-page__content">
          <h1>Admin View</h1>
          <h2>Pull Mine Manager History</h2>
          <Input
            placeholder="Enter a Mine Number"
            value={this.state.mineNo}
            onChange={this.handleChange}
            style={{ width: "50%", "max-width": "300px" }}
          />
          <Button onClick={this.handleDownload}>Download History</Button>
        </div>
      </div>
    );
  }
}

export default AuthorizationGuard(Permission.ADMIN)(AdminDashboard);
