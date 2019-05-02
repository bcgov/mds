import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import EditVarianceForm from "@/components/Forms/variances/EditVarianceForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  mineGuid: PropTypes.string.isRequired,
  mineName: PropTypes.string.isRequired,
  coreUsers: CustomPropTypes.options.isRequired,
  variance: CustomPropTypes.variance.isRequired,
  varianceStatusOptions: CustomPropTypes.options.isRequired,
  initialValues: CustomPropTypes.variance.isRequired,
};

export const ViewVarianceModal = (props) => (
  <div>
    <EditVarianceForm
      onSubmit={props.onSubmit}
      closeModal={props.closeModal}
      mineGuid={props.mineGuid}
      mineName={props.mineName}
      coreUsers={props.coreUsers}
      variance={props.variance}
      varianceStatusOptions={props.varianceStatusOptions}
      initialValues={props.initialValues}
    />
  </div>
);

ViewVarianceModal.propTypes = propTypes;

export default ViewVarianceModal;
