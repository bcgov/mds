import React from "react";
import NewMinespaceUser from "@/components/admin/NewMinespaceUser";
import ExistingMinespaceUsers from "@/components/admin/ExistingMinespaceUsers";
/**
 * @class AdminDashboard houses everything related to admin tasks, this is a permission-based route.
 */

export const MinespaceUserManagement = () => (
  <div>
    <h2>Minespace User Management</h2>
    <NewMinespaceUser />
    <ExistingMinespaceUsers />
  </div>
);

export default MinespaceUserManagement;
