import React from "react";
import PropTypes from "prop-types";
import AddMineAlertForm from "@/components/Forms/mineAlerts/AddMineAlertForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  mineGuid: PropTypes.string.isRequired,
};

export const AddMineAlertModal = (props) => (
  <div>
    <AddMineAlertForm
      onSubmit={props.onSubmit}
      closeModal={props.closeModal}
      mine={props.mine}
      title={props.title}
      {...props}
    />
  </div>
);

AddMineAlertModal.propTypes = propTypes;

export default AddMineAlertModal;
