import React from "react";
import PropTypes from "prop-types";
import UploadPermitDocumentForm from "@/components/Forms/permits/UploadPermitDocumentForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};

export const UploadPermitDocumentModal = (props) => <UploadPermitDocumentForm {...props} />;

UploadPermitDocumentModal.propTypes = propTypes;

export default UploadPermitDocumentModal;
