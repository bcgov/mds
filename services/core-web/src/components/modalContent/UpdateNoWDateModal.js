import React from "react";
import PropTypes from "prop-types";
import UpdateNOWDateForm from "@/components/Forms/noticeOfWork/UpdateNOWDateForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string,
};

const defaultProps = {
  title: "",
};

export const UpdateNoWDateModal = (props) => (
  <div>
    <UpdateNOWDateForm {...props} />
  </div>
);

UpdateNoWDateModal.propTypes = propTypes;
UpdateNoWDateModal.defaultProps = defaultProps;

export default UpdateNoWDateModal;
