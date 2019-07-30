import React from "react";
import PropTypes from "prop-types";
import AddReportForm from "@/components/Forms/reports/AddReportForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  mineGuid: PropTypes.string.isRequired,
};

const defaultProps = {};

export const AddReportModal = (props) => (
  <div>
    <AddReportForm
      onSubmit={props.onSubmit}
      closeModal={props.closeModal}
      title={props.title}
      mineGuid={props.mineGuid}
    />
  </div>
);

AddReportModal.propTypes = propTypes;
AddReportModal.defaultProps = defaultProps;
export default AddReportModal;
