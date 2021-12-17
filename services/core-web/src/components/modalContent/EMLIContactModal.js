import React from "react";
import PropTypes from "prop-types";
import EMLIContactForm from "@/components/Forms/EMLIContacts/EMLIContactForm";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  title: PropTypes.string.isRequired,
};

const defaultProps = {};

export const EMLIContactModal = (props) => {
  return (
    <div>
      <EMLIContactForm {...props} />
    </div>
  );
};

EMLIContactModal.propTypes = propTypes;
EMLIContactModal.defaultProps = defaultProps;

export default EMLIContactModal;
