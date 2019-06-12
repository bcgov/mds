import React from "react";
import PropTypes from "prop-types";
import MineRecordForm from "@/components/Forms/MineRecordForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  isCreated: PropTypes.bool,
};

const defaultProps = {
  isCreated: false,
};

export const MineRecordModal = (props) => (
  <div>
    <MineRecordForm {...props} />
  </div>
);

MineRecordModal.propTypes = propTypes;
MineRecordModal.defaultProps = defaultProps;

export default MineRecordModal;
