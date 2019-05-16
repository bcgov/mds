import React, { Component } from "react";
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
  removeDocument: PropTypes.func.isRequired,
};

export class EditVarianceModal extends Component {
  componentWillReceiveProps(nextProps) {
    const documentsChanged = nextProps.variance !== this.props.variance;
    if (documentsChanged) {
      console.log("IM HERE");
    }
  }

  render() {
    return (
      <EditVarianceForm
        onSubmit={this.props.onSubmit}
        closeModal={this.props.closeModal}
        mineGuid={this.props.mineGuid}
        mineName={this.props.mineName}
        coreUsers={this.props.coreUsers}
        variance={this.props.variance}
        varianceStatusOptions={this.props.varianceStatusOptions}
        initialValues={this.props.initialValues}
        removeDocument={this.props.removeDocument}
      />
    );
  }
}

EditVarianceModal.propTypes = propTypes;

export default EditVarianceModal;
