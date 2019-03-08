import React from "react";
import PropTypes from "prop-types";
import AddPermitAmendmentForm from "@/components/Forms/AddPermitAmendmentForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string,
};

const defaultProps = {
  title: "",
};

export const AddPermitAmendmentModal = (props) => (
  <div>
    <AddPermitAmendmentForm {...props} />
  </div>
);

AddPermitAmendmentModal.propTypes = propTypes;
AddPermitAmendmentModal.defaultProps = defaultProps;

export default AddPermitAmendmentModal;
