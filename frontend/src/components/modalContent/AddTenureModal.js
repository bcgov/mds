import React from "react";
import PropTypes from "prop-types";
import AddTenureNumberForm from "@/components/Forms/AddTenureNumberForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};

const defaultProps = {
  title: "",
};

export const AddTenureModal = (props) => (
  <div>
    <AddTenureNumberForm {...props} />
  </div>
);

AddTenureModal.propTypes = propTypes;
AddTenureModal.defaultProps = defaultProps;
export default AddTenureModal;
