import React from "react";
import PropTypes from "prop-types";
import UploadMajorMineApplicationDocumentForm from "@/components/Forms/UploadMajorMineApplicationDocumentForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  instructions: PropTypes.string.isRequired,
  contentTitle: PropTypes.string.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export const UploadMajorMineApplicationDocumentModal = (props) => (
  <UploadMajorMineApplicationDocumentForm {...props} />
);

UploadMajorMineApplicationDocumentModal.propTypes = propTypes;
export default UploadMajorMineApplicationDocumentModal;
