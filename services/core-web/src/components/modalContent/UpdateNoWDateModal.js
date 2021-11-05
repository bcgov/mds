import React from "react";
import PropTypes from "prop-types";
import UpdateprogressDateForm from "@/components/Forms/noticeOfWork/UpdateprogressDateForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string,
};

const defaultProps = {
  title: "",
};

export const UpdateNoWDateModal = (props) => (
  <div>
    <UpdateprogressDateForm {...props} />
  </div>
);

UpdateNoWDateModal.propTypes = propTypes;
UpdateNoWDateModal.defaultProps = defaultProps;

export default UpdateNoWDateModal;