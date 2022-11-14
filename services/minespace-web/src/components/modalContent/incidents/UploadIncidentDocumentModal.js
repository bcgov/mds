import React from "react";
import PropTypes from "prop-types";
import "@ant-design/compatible/assets/index.css";
import UploadIncidentDocumentForm from "@/components/Forms/incidents/UploadIncidentDocumentForm";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
};

const defaultProps = {};

export const UploadIncidentDocumentModal = (props) => {
  const { onSubmit } = props;

  return <UploadIncidentDocumentForm handleSave={onSubmit} {...props} />;
};

UploadIncidentDocumentModal.propTypes = propTypes;
UploadIncidentDocumentModal.defaultProps = defaultProps;

export default UploadIncidentDocumentModal;
