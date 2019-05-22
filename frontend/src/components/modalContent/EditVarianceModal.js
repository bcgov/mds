import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import CustomPropTypes from "@/customPropTypes";
import EditVarianceForm from "@/components/Forms/variances/EditVarianceForm";
import {
  fetchVariancesById,
  removeDocumentFromVariance,
  fetchVariancesByMine,
} from "@/actionCreators/varianceActionCreator";
import { getVariance } from "@/selectors/varianceSelectors";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  mineGuid: PropTypes.string.isRequired,
  mineName: PropTypes.string.isRequired,
  coreUsers: CustomPropTypes.options.isRequired,
  variance: CustomPropTypes.variance,
  varianceStatusOptions: CustomPropTypes.options.isRequired,
  fetchVariancesById: PropTypes.func.isRequired,
  varianceGuid: PropTypes.string.isRequired,
  removeDocumentFromVariance: PropTypes.func.isRequired,
  fetchVariancesByMine: PropTypes.func.isRequired,
};

const defaultProps = {
  variance: {},
};

export class EditVarianceModal extends Component {
  componentDidMount() {
    this.props.fetchVariancesById(this.props.mineGuid, this.props.varianceGuid);
  }

  handleRemoveDocument = (event, varianceGuid, documentGuid) => {
    event.preventDefault();
    this.props
      .removeDocumentFromVariance(this.props.mineGuid, varianceGuid, documentGuid)
      .then(() => {
        this.props.fetchVariancesById(this.props.mineGuid, varianceGuid);
        this.props.fetchVariancesByMine({ mineGuid: this.props.mineGuid });
      });
  };

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
        initialValues={this.props.variance}
        removeDocument={this.handleRemoveDocument}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  variance: getVariance(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchVariancesById,
      removeDocumentFromVariance,
      fetchVariancesByMine,
    },
    dispatch
  );

EditVarianceModal.propTypes = propTypes;
EditVarianceModal.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditVarianceModal);
