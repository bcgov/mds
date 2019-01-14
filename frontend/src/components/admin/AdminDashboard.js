import React from "react";
import { MinespaceUserManagement } from "@/components/admin/MinespaceUserManagement";
/**
 * @class AdminDashboard houses everything related to admin tasks, this is a permission-based route.
 */

export const AdminDashboard = () => (
  <div className="landing-page">
    <div className="landing-page__header" />
    <div className="landing-page__content">
      <h1>Admin View</h1>
      <MinespaceUserManagement />
    </div>
  </div>
);

export default AdminDashboard;
