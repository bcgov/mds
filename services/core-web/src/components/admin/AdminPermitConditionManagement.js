import React from "react";
import { Divider } from "antd";
import StandardPermitConditions from "@/components/Forms/permits/conditions/StandardPermitConditions";
import { AuthorizationGuard } from "@/HOC/AuthorizationGuard";
import * as Permission from "@/constants/permissions";

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

export default AuthorizationGuard(Permission.EDIT_TEMPLATE_PERMIT_CONDITIONS)(
  AdminPermitConditionManagement
);
