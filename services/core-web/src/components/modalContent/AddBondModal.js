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

  return (
    <div>
      {props.editBond && (
        <div>
          <Alert
            message="Need to change something?"
            description="Ability to edit a bond is available for minor changes. If large changes are required, it is recommended to release and create a new bond record, as history of changes are not being tracked at this time."
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
