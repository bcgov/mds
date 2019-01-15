import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import EditTailingsReportForm from "@/components/Forms/EditTailingsReportForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any),
  statusOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  selectedDocument: CustomPropTypes.mineExpectedDocument.isRequired,
};

const defaultProps = {
  initialValues: null,
};

export const EditTailingsReportModal = (props) => (
  <div>
    <EditTailingsReportForm {...props} />
  </div>
);

EditTailingsReportModal.propTypes = propTypes;
EditTailingsReportModal.defaultProps = defaultProps;

export default EditTailingsReportModal;
