import React from "react";
import PropTypes from "prop-types";
import EditTailingsReportForm from "@/components/Forms/EditTailingsReportForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any),
  statusOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
    })
  ).isRequired,
  selectedDocument: PropTypes.shape({
    exp_document_guid: PropTypes.string,
    mine_guid: PropTypes.string,
  }).isRequired,
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
