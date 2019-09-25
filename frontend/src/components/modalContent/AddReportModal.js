import React from "react";
import PropTypes from "prop-types";

import AddReportForm from "@/components/Forms/reports/AddReportForm";

const propTypes = {
  disableAddReport: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  mineGuid: PropTypes.string.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any),
};

const defaultProps = { initialValues: {}, disableAddReport: false };

export const AddReportModal = (props) => (
  <div>
    <AddReportForm
      disableAddReport={props.disableAddReport}
      onSubmit={props.onSubmit}
      closeModal={props.closeModal}
      title={props.title}
      mineGuid={props.mineGuid}
      initialValues={props.initialValues}
    />
  </div>
);

AddReportModal.propTypes = propTypes;
AddReportModal.defaultProps = defaultProps;

export default AddReportModal;
