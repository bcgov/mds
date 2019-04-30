import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import EditVarianceForm from "@/components/Forms/variances/EditVarianceForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  mineGuid: PropTypes.string.isRequired,
  coreUsers: CustomPropTypes.dropdownListItem.isRequired,
};

export const ViewVarianceModal = (props) => (
  <div>
    <EditVarianceForm
      onSubmit={props.onSubmit}
      closeModal={props.closeModal}
      mineGuid={props.mineGuid}
      coreUsers={props.coreUsers}
    />
  </div>
);

ViewVarianceModal.propTypes = propTypes;

export default ViewVarianceModal;
