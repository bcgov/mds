import React from "react";
import { AuthorizationGuard } from "@/HOC/AuthorizationGuard";
import * as Permission from "@/constants/permissions";
import MinespaceUserManagement from "@/components/admin/MinespaceUserManagement";
/**
 * @class AdminDashboard houses everything related to admin tasks, this is a permission-based route.
 */

export const AdminDashboard = () => (
  <div className="landing-page">
    <div className="landing-page__header">
      <h1>Admin View</h1>
    </div>
    <div className="landing-page__content">
      <div className="tab__content">
        <MinespaceUserManagement />
      </div>
    </div>
  </div>
);

export default AuthorizationGuard(Permission.ADMIN)(AdminDashboard);
