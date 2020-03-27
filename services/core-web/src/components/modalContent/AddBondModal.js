import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Alert } from "antd";
import {
  getDropdownProvinceOptions,
  getBondTypeDropDownOptions,
} from "@common/selectors/staticContentSelectors";
import BondForm from "@/components/Forms/Securities/BondForm";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  bondTypeOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  provinceOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  permitGuid: PropTypes.string.isRequired,
  bond: CustomPropTypes.bond.isRequired,
  editBond: PropTypes.bool,
};

const defaultProps = {
  editBond: false,
};

export const AddBondModal = (props) => {
  const handleAddBond = (values) =>
    props.editBond
      ? props.onSubmit(values, props.bond.bond_guid)
      : props.onSubmit(values, props.permitGuid);
  const initialPartyValue = props.editBond
    ? {
        key: props.bond.payer_party_guid,
        props: { value: props.bond.payer_party_guid, children: props.bond.payer.name },
      }
    : "";
  return (
    <div>
      {props.editBond && (
        <div>
          <Alert
            message="Making a correction?"
            description="Use this window to make corrections to bonds you have recorded.
            If you want to record a change and keep the history of the bond, release this bond and record a new one instead."
            type="info"
            showIcon
            style={{ textAlign: "left" }}
          />
          <br />
        </div>
      )}
      <BondForm
        onSubmit={handleAddBond}
        closeModal={props.closeModal}
        title={props.title}
        initialPartyValue={initialPartyValue}
        provinceOptions={props.provinceOptions}
        bondTypeOptions={props.bondTypeOptions}
        initialValues={props.bond}
      />
    </div>
  );
};

AddBondModal.propTypes = propTypes;
AddBondModal.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  provinceOptions: getDropdownProvinceOptions(state),
  bondTypeOptions: getBondTypeDropDownOptions(state),
});

export default connect(mapStateToProps)(AddBondModal);
