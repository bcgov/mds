import React from "react";
import PropTypes from "prop-types";
import GenerateDocumentForm from "@/components/Forms/GenerateDocumentForm";

const propTypes = {
  // TODO: Create a custom prop-type for document templates.
  template: PropTypes.objectOf(PropTypes.any).isRequired,
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string,
};

const defaultProps = {
  title: "Generate Document",
};

export const GenerateDocumentModal = (props) => (
  <div>
    <GenerateDocumentForm {...props} />
  </div>
);

GenerateDocumentModal.propTypes = propTypes;
GenerateDocumentModal.defaultProps = defaultProps;
export default GenerateDocumentModal;
