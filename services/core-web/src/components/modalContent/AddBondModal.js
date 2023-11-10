import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Alert } from "antd";
import { getFormValues } from "redux-form";
import {
  getDropdownProvinceOptions,
  getBondTypeDropDownOptions,
  getBondDocumentTypeDropDownOptions,
  getBondDocumentTypeOptionsHash,
  getBondStatusOptionsHash,
} from "@mds/common/redux/selectors/staticContentSelectors";
import * as FORM from "@/constants/forms";
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
  bondStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  permitGuid: PropTypes.string.isRequired,
  mineGuid: PropTypes.string.isRequired,
  bond: CustomPropTypes.bond,
  editBond: PropTypes.bool,
  formValues: CustomPropTypes.invoice.isRequired,
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
  const initialPartyValue = props.editBond
    ? {
        value: props.bond.payer_party_guid,
        label: props.bond.payer.name,
      }
    : "";
  const projectIdChanged = props.bond.project_id !== props.formValues.project_id;
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
      {projectIdChanged && (
        <div>
          <Alert
            message="Changing this number will change the Project ID for all bonds under this permit Number."
            type="warning"
            showIcon
          />
        </div>
      )}
      <BondForm
        onSubmit={handleAddBond}
        closeModal={props.closeModal}
        title={props.title}
        initialPartyValue={initialPartyValue}
        provinceOptions={props.provinceOptions}
        bondTypeDropDownOptions={props.bondTypeDropDownOptions}
        bondDocumentTypeDropDownOptions={props.bondDocumentTypeDropDownOptions}
        bondDocumentTypeOptionsHash={props.bondDocumentTypeOptionsHash}
        bondStatusOptionsHash={props.bondStatusOptionsHash}
        initialValues={props.bond}
        bond={props.bond}
        mineGuid={props.mineGuid}
        editBond={props.editBond}
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
  bondStatusOptionsHash: getBondStatusOptionsHash(state),
  formValues: getFormValues(FORM.ADD_BOND)(state) || {},
});

export default connect(mapStateToProps)(AddBondModal);
