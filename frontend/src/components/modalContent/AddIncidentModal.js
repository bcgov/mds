import React from "react";
import PropTypes from "prop-types";
import AddIncidentForm from "@/components/Forms/AddIncidentForm";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  title: PropTypes.string,
  followupActionOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
};

const defaultProps = {
  title: "",
};

export const AddIncidentModal = (props) => (
  <div>
    <AddIncidentForm
      handleSubmit={props.handleSubmit}
      closeModal={props.closeModal}
      title={props.title}
      followupActionOptions={props.followupActionOptions}
    />
  </div>
);

AddIncidentModal.propTypes = propTypes;
AddIncidentModal.defaultProps = defaultProps;

export default AddIncidentModal;
