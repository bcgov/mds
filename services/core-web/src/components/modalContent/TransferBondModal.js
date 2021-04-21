import React from "react";
import PropTypes from "prop-types";
import { Alert } from "antd";
import TransferBondForm from "@/components/Forms/Securities/TransferBondForm";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  permitGuid: PropTypes.string.isRequired,
  bond: CustomPropTypes.bond.isRequired,
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
};

export const TransferBondModal = (props) => {
  const handleTransferBond = (values) => props.onSubmit(values, props.bond);
  return (
    <div>
      <Alert
        message="Transfer this bond to a different permit"
        description="This action will release the current bond and create a new bond using the same information under the selected permit. Any note created will be added to the new bond and the transferred bond."
        type="info"
        showIcon
        style={{ textAlign: "left" }}
      />
      <br />
      <TransferBondForm
        onSubmit={handleTransferBond}
        closeModal={props.closeModal}
        title={props.title}
        initialValues={{ note: props.bond.note }}
        permits={props.permits.filter(({ permit_guid }) => permit_guid !== props.permitGuid)}
      />
    </div>
  );
};

TransferBondModal.propTypes = propTypes;

export default TransferBondModal;
