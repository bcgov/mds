import React from "react";
import PropTypes from "prop-types";
import AddIncidentForm from "@/components/Forms/AddIncidentForm";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string,
  followupActionOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  incidentDeterminationOptions: CustomPropTypes.options.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
};

const defaultProps = {
  title: "",
};

export const AddIncidentModal = (props) => (
  <div>
    <AddIncidentForm
      closeModal={props.closeModal}
      onSubmit={props.onSubmit}
      title={props.title}
      followupActionOptions={props.followupActionOptions}
      incidentDeterminationOptions={props.incidentDeterminationOptions}
      initialValues={props.initialValues}
    />
  </div>
);
AddIncidentModal.propTypes = propTypes;
AddIncidentModal.defaultProps = defaultProps;

export default AddIncidentModal;
