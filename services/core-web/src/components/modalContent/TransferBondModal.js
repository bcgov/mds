/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Alert } from "antd";
import {
  getDropdownProvinceOptions,
  getBondTypeDropDownOptions,
  getBondDocumentTypeDropDownOptions,
  getBondDocumentTypeOptionsHash,
} from "@common/selectors/staticContentSelectors";
import TransferBondForm from "@/components/Forms/Securities/TransferBondForm";
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
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
};

const defaultProps = {
  bond: {},
};

export const TransferBondModal = (props) => {
  const handleAddBond = (values) => {
    console.log("transferring..");
    const newPermitGuid = values.permit_guid;
    delete values.permit_guid;
    const releasedBond = { ...props.bond, bond_status_code: "REL" };

    const bondGuid = releasedBond.bond_guid;
    // payload expects the basic bond object without the following:
    delete releasedBond.permit_guid;
    delete releasedBond.bond_id;
    delete releasedBond.bond_guid;
    delete releasedBond.payer;
    // Since the form is populated with the bond initialValues, remove all nullValues from object when creating newBond
    Object.keys(values).forEach((key) => values[key] == null && delete values[key]);
    delete values.payer;
    delete values.bond_guid;
    // new payload object in the format that the API is expecting
    const payload = {
      bond: {
        bond_status_code: "ACT",
        ...values,
      },
      permit_guid: newPermitGuid,
    };

    props.onSubmit(releasedBond, bondGuid, payload);
  };

  const initialPartyValue = props.editBond
    ? {
        key: props.bond.payer_party_guid,
        label: props.bond.payer.name,
      }
    : "";
  const initialValues = () => {
    delete props.bond.permit_guid;
    return props.bond;
  };
  return (
    <div>
      <Alert
        message="Transfer to a different Permit"
        description="This action will release the current bond and record a new bond using the same information under the selected permit."
        type="info"
        showIcon
        style={{ textAlign: "left" }}
      />
      <br />
      <TransferBondForm
        onSubmit={handleAddBond}
        closeModal={props.closeModal}
        title={props.title}
        initialPartyValue={initialPartyValue}
        provinceOptions={props.provinceOptions}
        bondTypeDropDownOptions={props.bondTypeDropDownOptions}
        bondDocumentTypeDropDownOptions={props.bondDocumentTypeDropDownOptions}
        bondDocumentTypeOptionsHash={props.bondDocumentTypeOptionsHash}
        initialValues={initialValues()}
        bond={props.bond}
        mineGuid={props.mineGuid}
        permits={props.permits.filter(({ permit_guid }) => permit_guid !== props.permitGuid)}
      />
    </div>
  );
};

TransferBondModal.propTypes = propTypes;
TransferBondModal.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  provinceOptions: getDropdownProvinceOptions(state),
  bondTypeDropDownOptions: getBondTypeDropDownOptions(state),
  bondDocumentTypeDropDownOptions: getBondDocumentTypeDropDownOptions(state),
  bondDocumentTypeOptionsHash: getBondDocumentTypeOptionsHash(state),
});

export default connect(mapStateToProps)(TransferBondModal);
