import React from "react";
import PropTypes from "prop-types";
import UploadProjectDecisionPackageDocumentForm from "@/components/Forms/UploadProjectDecisionPackageDocumentForm";

const propTypes = {
  title: PropTypes.string.isRequired,
  instructions: PropTypes.string.isRequired,
  projectGuid: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export const UploadProjectDecisionPackageDocumentModal = (props) => (
  <UploadProjectDecisionPackageDocumentForm {...props} />
);

UploadProjectDecisionPackageDocumentModal.propTypes = propTypes;
export default UploadProjectDecisionPackageDocumentModal;
