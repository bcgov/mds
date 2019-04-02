import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import AddVarianceForm from "@/components/Forms/variances/AddVarianceForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  mineGuid: PropTypes.string.isRequired,
  mineNo: PropTypes.string.isRequired,
  complianceCodes: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
};

export const AddVarianceModal = (props) => (
  <div>
    <AddVarianceForm
      onSubmit={props.onSubmit}
      closeModal={props.closeModal}
      mineGuid={props.mineGuid}
      mineNo={props.mineNo}
      complianceCodes={props.complianceCodes}
    />
  </div>
);

AddVarianceModal.propTypes = propTypes;

export default AddVarianceModal;
