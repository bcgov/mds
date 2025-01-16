import React from "react";
import PropTypes from "prop-types";
import MinistryContactForm from "@/components/Forms/MinistryContacts/MinistryContactForm";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  title: PropTypes.string.isRequired,
};

const defaultProps = {};

export const MinistryContactModal = (props) => {
  return (
    <div>
      <MinistryContactForm {...props} />
    </div>
  );
};

MinistryContactModal.propTypes = propTypes;
MinistryContactModal.defaultProps = defaultProps;

export default MinistryContactModal;
