import React from "react";
import PropTypes from "prop-types";
import NewMinespaceUser from "@/components/admin/NewMinespaceUser";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string,
};

const defaultProps = {
  title: "",
};

export const UpdateMinespaceUserModal = (props) => (
  <div>
    <NewMinespaceUser {...props} />
  </div>
);

UpdateMinespaceUserModal.propTypes = propTypes;
UpdateMinespaceUserModal.defaultProps = defaultProps;

export default UpdateMinespaceUserModal;
