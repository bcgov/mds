import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getDropdownProvinceOptions } from "@common/selectors/staticContentSelectors";
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
    props.onSubmit(values, props.permitGuid);
  };

  return (
    <div>
      <BondForm
        onSubmit={handleAddBond}
        closeModal={props.closeModal}
        title={props.title}
        provinceOptions={props.provinceOptions}
      />
    </div>
  );
};

AddBondModal.propTypes = propTypes;

const mapStateToProps = (state) => ({
  provinceOptions: getDropdownProvinceOptions(state),
});

export default connect(mapStateToProps)(AddBondModal);
