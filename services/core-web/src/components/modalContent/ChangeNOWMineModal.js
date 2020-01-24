import React from "react";
import PropTypes from "prop-types";
import ChangeNOWMineForm from "@/components/Forms/noticeOfWork/ChangeNOWMineForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string,
};

const defaultProps = {
  title: "",
};

export const ChangeNOWMineModal = (props) => (
  <div>
    <ChangeNOWMineForm {...props} />
  </div>
);

ChangeNOWMineModal.propTypes = propTypes;
ChangeNOWMineModal.defaultProps = defaultProps;
export default ChangeNOWMineModal;
