import React from "react";
import PropTypes from "prop-types";
import UpdateMinespaceUser from "@/components/admin/UpdateMinespaceUser";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  title: PropTypes.string,
};

const defaultProps = {
  title: "",
};

export const UpdateMinespaceUserModal = (props) => (
  <div>
    <UpdateMinespaceUser {...props} />
  </div>
);

UpdateMinespaceUserModal.propTypes = propTypes;
UpdateMinespaceUserModal.defaultProps = defaultProps;

export default UpdateMinespaceUserModal;
