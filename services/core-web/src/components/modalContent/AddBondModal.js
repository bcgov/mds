import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  getDropdownProvinceOptions,
  getBondTypeDropDownOptions,
  getBondDocumentTypeDropDownOptions,
  getBondDocumentTypeOptionsHash,
} from "@common/selectors/staticContentSelectors";
import BondForm from "@/components/Forms/Securities/BondForm";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  bondTypeDropDownOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  provinceOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  bondDocumentTypeDropDownOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  bondDocumentTypeOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
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
  const handleAddBond = (values) =>
    props.editBond
      ? props.onSubmit(values, props.bond.bond_guid)
      : props.onSubmit(values, props.permitGuid);

  return (
    <div>
      <BondForm
        onSubmit={handleAddBond}
        closeModal={props.closeModal}
        title={props.title}
        provinceOptions={props.provinceOptions}
        bondTypeDropDownOptions={props.bondTypeDropDownOptions}
        bondDocumentTypeDropDownOptions={props.bondDocumentTypeDropDownOptions}
        bondDocumentTypeOptionsHash={props.bondDocumentTypeOptionsHash}
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
  bondTypeDropDownOptions: getBondTypeDropDownOptions(state),
  bondDocumentTypeDropDownOptions: getBondDocumentTypeDropDownOptions(state),
  bondDocumentTypeOptionsHash: getBondDocumentTypeOptionsHash(state),
});

export default connect(mapStateToProps)(AddBondModal);
