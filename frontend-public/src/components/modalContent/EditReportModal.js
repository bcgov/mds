import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import EditReportForm from "@/components/Forms/EditReportForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any),
  selectedDocument: CustomPropTypes.mineExpectedDocument.isRequired,
};

const defaultProps = {
  initialValues: null,
};

export const EditReportModal = (props) => (
  <div>
    <EditReportForm {...props} />
  </div>
);

EditReportModal.propTypes = propTypes;
EditReportModal.defaultProps = defaultProps;

export default EditReportModal;
