import React from "react";
import PropTypes from "prop-types";
import EditVarianceForm from "@/components/Forms/variances/EditVarianceForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  mineGuid: PropTypes.string.isRequired,
};

export const ViewVarianceModal = (props) => (
  <div>
    <EditVarianceForm
      onSubmit={props.onSubmit}
      closeModal={props.closeModal}
      mineGuid={props.mineGuid}
    />
  </div>
);

ViewVarianceModal.propTypes = propTypes;

export default ViewVarianceModal;
