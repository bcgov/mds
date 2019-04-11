import React from "react";
import PropTypes from "prop-types";
import AddIncidentForm from "@/components/Forms/AddIncidentForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string,
};

const defaultProps = {
  title: "",
};

export const AddIncidentModal = (props) => (
  <div>
    <AddIncidentForm {...props} />
  </div>
);

AddIncidentModal.propTypes = propTypes;
AddIncidentModal.defaultProps = defaultProps;

export default AddIncidentModal;
