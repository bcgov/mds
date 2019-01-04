import React from "react";
import PropTypes from "prop-types";
import MineRecordForm from "@/components/Forms/MineRecordForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};

export const MineRecordModal = (props) => (
  <div>
    <MineRecordForm {...props} />
  </div>
);

MineRecordModal.propTypes = propTypes;

export default MineRecordModal;
