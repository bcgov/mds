import React from "react";
import PropTypes from "prop-types";
import AddMineWorkInformationForm from "@/components/Forms/AddMineWorkInformationForm";

const propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.objectOf(PropTypes.any)]).isRequired,
  mineGuid: PropTypes.string.isRequired,
  mineWorkInformationGuid: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any),
};

const defaultProps = {
  initialValues: {},
};

export const AddMineWorkInformationModal = (props) => (
  <AddMineWorkInformationForm
    onSubmit={props.onSubmit}
    closeModal={props.closeModal}
    title={props.title}
    mineGuid={props.mineGuid}
    initialValues={props.initialValues}
  />
);

AddMineWorkInformationModal.propTypes = propTypes;
AddMineWorkInformationModal.defaultProps = defaultProps;

export default AddMineWorkInformationModal;
