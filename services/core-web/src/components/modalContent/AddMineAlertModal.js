import React from "react";
import PropTypes from "prop-types";
import AddMineAlertForm from "@/components/Forms/mineAlerts/AddMineAlertForm";
import customPropTypes from "@/customPropTypes";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  mineGuid: PropTypes.string.isRequired,
  mine: customPropTypes.mine.isRequired,
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
