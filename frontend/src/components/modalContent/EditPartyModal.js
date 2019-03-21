import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import EditFullPartyForm from "@/components/Forms/parties/EditFullPartyForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  isPerson: PropTypes.bool.isRequired,
  provinceOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  initialValues: PropTypes.objectOf(PropTypes.string).isRequired,
};

export const EditPartyModal = (props) => (
  <div>
    <EditFullPartyForm
      onSubmit={props.onSubmit}
      closeModal={props.closeModal}
      isPerson={props.isPerson}
      provinceOptions={props.provinceOptions}
      initialValues={props.initialValues}
    />
  </div>
);

EditPartyModal.propTypes = propTypes;
export default EditPartyModal;
