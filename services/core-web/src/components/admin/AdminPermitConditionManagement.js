/* eslint-disable */
import React, { Component } from "react";
import { Divider } from "antd";
import StandardPermitConditions from "@/components/Forms/permits/conditions/StandardPermitConditions";

const propTypes = {};

const defaultProps = {};

export class AdminPermitConditionManagement extends Component {
  render() {
    return (
      <div className="tab__content">
        <h2>Permit Conditions</h2>
        <Divider />
        <br />
        <StandardPermitConditions />
      </div>
    );
  }
}

AdminPermitConditionManagement.propTypes = propTypes;
AdminPermitConditionManagement.defaultProps = defaultProps;

export default AdminPermitConditionManagement;
