import React from "react";
import AddMinespaceUser from "@/components/forms/AddMinespaceUser";
/**
 * @class AdminDashboard houses everything related to admin tasks, this is a permission-based route.
 */

export const NewMinespaceUser = () => (
  <div>
    <h3>Add BCEID User</h3>
    <AddMinespaceUser />
  </div>
);

export default NewMinespaceUser;
