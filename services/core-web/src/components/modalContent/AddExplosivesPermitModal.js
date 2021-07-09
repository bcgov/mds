import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import ExplosivesPermitForm from "@/components/Forms/ExplosivesPermit/ExplosivesPermitForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.string).isRequired,
  mineGuid: PropTypes.string.isRequired,
  isApproved: PropTypes.bool.isRequired,
  documentTypeDropdownOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  isPermitTab: PropTypes.bool.isRequired,
  inspectors: CustomPropTypes.groupOptions.isRequired,
  initialMineOperatorValue: PropTypes.objectOf(PropTypes.string).isRequired,
};

export const AddExplosivesPermitModal = (props) => (
  <div>
    <ExplosivesPermitForm {...props} />
  </div>
);

AddExplosivesPermitModal.propTypes = propTypes;

export default AddExplosivesPermitModal;
