/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  getDropdownProvinceOptions,
  getBondTypeOptionsDropDownOptions,
} from "@common/selectors/staticContentSelectors";
import BondForm from "@/components/Forms/Securities/BondForm";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  provinceOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  permitGuid: PropTypes.string.isRequired,
};

export const AddBondModal = (props) => {
  const handleAddBond = (values) => {
    props.editBond
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
        bondStatusOptions={props.bondStatusOptions}
        initialValues={props.bond}
      />
    </div>
  );
};

AddBondModal.propTypes = propTypes;

const mapStateToProps = (state) => ({
  provinceOptions: getDropdownProvinceOptions(state),
  bondTypeOptions: getBondTypeOptionsDropDownOptions(state),
});

export default connect(mapStateToProps)(AddBondModal);
