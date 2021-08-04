import React from "react";
import { Divider } from "antd";
import StandardPermitConditions from "@/components/Forms/permits/conditions/StandardPermitConditions";

const propTypes = {};

const defaultProps = {};

export const AdminPermitConditionManagement = () => (
  <div className="tab__content">
    <h2>Permit Conditions</h2>
    <Divider />
    <br />
    <StandardPermitConditions />
  </div>
);

AdminPermitConditionManagement.propTypes = propTypes;
AdminPermitConditionManagement.defaultProps = defaultProps;

export default AdminPermitConditionManagement;
