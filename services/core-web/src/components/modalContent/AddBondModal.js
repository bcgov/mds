import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  getDropdownProvinceOptions,
  getBondTypeDropDownOptions,
  getBondDocumentTypeDropDownOptions,
} from "@common/selectors/staticContentSelectors";
import BondForm from "@/components/Forms/Securities/BondForm";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  bondTypeOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  provinceOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  bondDocumentTypeDropDownOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  permitGuid: PropTypes.string.isRequired,
  mineGuid: PropTypes.string.isRequired,
  bond: CustomPropTypes.bond,
  editBond: PropTypes.bool,
};

const defaultProps = {
  bond: {},
  editBond: false,
};

export const AddBondModal = (props) => {
  const handleAddBond = (values) => {
    console.log("AddBondModal handleAddBond values:\n", values);
    return props.editBond
      ? props.onSubmit(values, props.bond.bond_guid)
      : props.onSubmit(values, props.permitGuid);
  };

  return (
    <div>
      <BondForm
        onSubmit={handleAddBond}
        closeModal={props.closeModal}
        title={props.title}
        provinceOptions={props.provinceOptions}
        bondTypeOptions={props.bondTypeOptions}
        bondDocumentTypeDropDownOptions={props.bondDocumentTypeDropDownOptions}
        initialValues={props.bond}
        bond={props.bond}
        mineGuid={props.mineGuid}
      />
    </div>
  );
};

AddBondModal.propTypes = propTypes;
AddBondModal.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  provinceOptions: getDropdownProvinceOptions(state),
  bondTypeOptions: getBondTypeDropDownOptions(state),
  bondDocumentTypeDropDownOptions: getBondDocumentTypeDropDownOptions(state),
});

export default connect(mapStateToProps)(AddBondModal);
