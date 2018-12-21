import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import MineRecordForm from "@/components/Forms/MineRecordForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  mineStatusOptions: CustomPropTypes.options.isRequired,
  title: PropTypes.string.isRequired,
  initialValues: PropTypes.object,
};

const defaultProps = {
  initialValues: null,
};

export const MineRecordModal = (props) => (
  <div>
    <MineRecordForm {...props} />
  </div>
);

MineRecordModal.propTypes = propTypes;
MineRecordModal.defaultProps = defaultProps;

export default MineRecordModal;
