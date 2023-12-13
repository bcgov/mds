import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@mds/common/customPropTypes";
import EditReportForm from "@/components/Forms/reports/EditReportForm";

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  mineReport: CustomPropTypes.mineReport.isRequired,
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export const EditReportModal = (props) => (
  <EditReportForm
    mineGuid={props.mineGuid}
    mineReport={props.mineReport}
    onSubmit={props.onSubmit}
    closeModal={props.closeModal}
  />
);

EditReportModal.propTypes = propTypes;

export default EditReportModal;
