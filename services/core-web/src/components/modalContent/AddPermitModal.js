import React from "react";
import PropTypes from "prop-types";
import AddPermitForm from "@/components/Forms/AddPermitForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string,
  mine_guid: PropTypes.string.isRequired,
};

const defaultProps = {
  title: "",
};

export const AddPermitModal = (props) => (
  <div>
    <AddPermitForm
      onSubmit={props.onSubmit}
      closeModal={props.closeModal}
      title={props.title}
      mine_guid={props.mine_guid}
    />
  </div>
);

AddPermitModal.propTypes = propTypes;
AddPermitModal.defaultProps = defaultProps;

export default AddPermitModal;
