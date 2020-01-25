import React from "react";
import PropTypes from "prop-types";
import AddReportForm from "@/components/Forms/reports/AddReportForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  mineGuid: PropTypes.string.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any),
};

const defaultProps = { initialValues: {} };

export const AddReportModal = (props) => (
  <AddReportForm
    onSubmit={props.onSubmit}
    closeModal={props.closeModal}
    title={props.title}
    mineGuid={props.mineGuid}
    initialValues={props.initialValues}
  />
);

AddReportModal.propTypes = propTypes;
AddReportModal.defaultProps = defaultProps;

export default AddReportModal;
