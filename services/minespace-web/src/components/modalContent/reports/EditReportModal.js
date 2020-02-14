import React from "react";
import PropTypes from "prop-types";
import EditReportForm from "@/components/Forms/reports/EditReportForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  mineGuid: PropTypes.string.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any),
};

const defaultProps = { initialValues: {} };

export const EditReportModal = (props) => (
  <EditReportForm
    onSubmit={props.onSubmit}
    closeModal={props.closeModal}
    title={props.title}
    mineGuid={props.mineGuid}
    initialValues={props.initialValues}
  />
);

EditReportModal.propTypes = propTypes;
EditReportModal.defaultProps = defaultProps;

export default EditReportModal;
