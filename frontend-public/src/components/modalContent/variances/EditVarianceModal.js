import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import CustomPropTypes from "@/customPropTypes";
import EditVarianceForm from "@/components/Forms/variances/EditVarianceForm";
import {
  fetchVarianceById,
  removeDocumentFromVariance,
  fetchVariancesByMine,
} from "@/actionCreators/varianceActionCreator";
import { getVariance } from "@/selectors/varianceSelectors";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  mineGuid: PropTypes.string.isRequired,
  mineName: PropTypes.string.isRequired,
  coreUsers: CustomPropTypes.options.isRequired,
  variance: CustomPropTypes.variance,
  varianceStatusOptions: CustomPropTypes.options.isRequired,
  fetchVarianceById: PropTypes.func.isRequired,
  varianceGuid: PropTypes.string.isRequired,
  removeDocumentFromVariance: PropTypes.func.isRequired,
  complianceCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  fetchVariancesByMine: PropTypes.func.isRequired,
};

const defaultProps = {
  variance: {},
};

export class EditVarianceModal extends Component {
  state = { isLoaded: false };

  componentDidMount() {
    this.props.fetchVarianceById(this.props.mineGuid, this.props.varianceGuid).then(() => {
      this.setState({ isLoaded: true });
    });
  }

  // handling delete functionality inside the modal, so the data can be updated properly.
  handleRemoveDocument = (event, documentGuid) => {
    event.preventDefault();
    this.props
      .removeDocumentFromVariance(this.props.mineGuid, this.props.varianceGuid, documentGuid)
      .then(() => {
        this.props.fetchVarianceById(this.props.mineGuid, this.props.varianceGuid);
        this.props.fetchVariancesByMine({ mineGuid: this.props.mineGuid });
      });
  };

  componentDidUnmount() {
    this.setState({ isLoaded: false });
  }

  render() {
    return (
      <div>
        <LoadingWrapper condition={this.state.isLoaded}>
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
            complianceCodesHash={this.props.complianceCodesHash}
          />
        </LoadingWrapper>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  variance: getVariance(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchVarianceById,
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
