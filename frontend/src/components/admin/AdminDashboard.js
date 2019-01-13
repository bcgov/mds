import React from "react";
import { AuthorizationGuard } from "@/HOC/AuthorizationGuard";

/**
 * @class AdminDashboard houses everything related to admin tasks, this is a permission-based route.
 */

export const AdminDashboard = () => (
  <div className="landing-page">
    <div className="landing-page__header" />
    <div className="landing-page__content">
      <h1>Admin View</h1>
    </div>
  </div>
);

export default AuthorizationGuard("role_admin")(AdminDashboard);
