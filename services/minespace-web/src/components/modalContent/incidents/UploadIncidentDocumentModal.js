import React from "react";
import PropTypes from "prop-types";
import UploadIncidentDocumentForm from "@/components/Forms/incidents/UploadIncidentDocumentForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};

const defaultProps = {};

export const UploadIncidentDocumentModal = (props) => {
  return <UploadIncidentDocumentForm {...props} />;
};

UploadIncidentDocumentModal.propTypes = propTypes;
UploadIncidentDocumentModal.defaultProps = defaultProps;

export default UploadIncidentDocumentModal;
