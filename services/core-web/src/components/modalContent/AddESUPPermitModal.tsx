import React, { FC } from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import AddESUPPermitForm from "@/components/Forms/AddESUPPermitForm";


const propTypes = {};

const defaultProps = {};
const AddESUPPermitModal = (props) => (
  <div>
    <AddESUPPermitForm {...props}/>
    {/* <AddESUPPermitForm
      onSubmit={props.onSubmit}
      closeModal={props.closeModal}
      title={props.title}
      mine_guid={props.mine_guid}
      isPermitTab={props.isPermitTab}
    /> */}
  </div>
);

// AddESUPPermitModal.propTypes = {
//     onSubmit: PropTypes.func.isRequired,
//     title: PropTypes.string.isRequired,
//     initialValues: PropTypes.objectOf(PropTypes.string).isRequired,
//     mineGuid: PropTypes.string.isRequired,
//     isApproved: PropTypes.bool.isRequired,
//     documentTypeDropdownOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
//     isPermitTab: PropTypes.bool.isRequired,
//     inspectors: CustomPropTypes.groupOptions.isRequired,
//   };
AddESUPPermitModal.propTypes = propTypes;
AddESUPPermitModal.defaultProps = defaultProps;

export default AddESUPPermitModal;
