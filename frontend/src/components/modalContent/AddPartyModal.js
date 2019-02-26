import React from "react";
import PropTypes from "prop-types";
import AddPartyForm from "@/components/Forms/AddPartyForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};

const defaultProps = {
  title: "",
};

export const AddTenureModal = (props) => (
  <div>
    <AddPartyForm {...props} />
  </div>
);

AddTenureModal.propTypes = propTypes;
AddTenureModal.defaultProps = defaultProps;
export default AddTenureModal;
