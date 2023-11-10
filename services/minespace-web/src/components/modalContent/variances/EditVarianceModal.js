import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  fetchVarianceById,
  removeDocumentFromVariance,
  fetchVariancesByMine,
} from "@mds/common/redux/actionCreators/varianceActionCreator";
import { getVariance } from "@mds/common/redux/selectors/varianceSelectors";
import CustomPropTypes from "@/customPropTypes";
import EditVarianceForm from "@/components/Forms/variances/EditVarianceForm";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  mineGuid: PropTypes.string.isRequired,
  mineName: PropTypes.string.isRequired,
  variance: CustomPropTypes.variance,
  fetchVarianceById: PropTypes.func.isRequired,
  varianceGuid: PropTypes.string.isRequired,
  removeDocumentFromVariance: PropTypes.func.isRequired,
  varianceStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  complianceCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  documentCategoryOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  fetchVariancesByMine: PropTypes.func.isRequired,
};

const defaultProps = {
  variance: {},
};

export class EditVarianceModal extends Component {
  state = { isLoaded: false };

  componentDidMount() {
    this.props
      .fetchVarianceById({ mineGuid: this.props.mineGuid, varianceGuid: this.props.varianceGuid })
      .then(() => {
        this.setState({ isLoaded: true });
      });
  }

  handleRemoveDocument = (event, documentGuid) => {
    event.preventDefault();
    return this.props
      .removeDocumentFromVariance({
        mineGuid: this.props.mineGuid,
        varianceGuid: this.props.varianceGuid,
        mineDocumentGuid: documentGuid,
      })
      .then(() => {
        this.props.fetchVarianceById({
          mineGuid: this.props.mineGuid,
          varianceGuid: this.props.varianceGuid,
        });
        this.props.fetchVariancesByMine({ mineGuid: this.props.mineGuid });
      });
  };

  render() {
    return (
      <LoadingWrapper isLoaded={this.state.isLoaded}>
        <EditVarianceForm
          onSubmit={this.props.onSubmit}
          closeModal={this.props.closeModal}
          mineGuid={this.props.mineGuid}
          mineName={this.props.mineName}
          variance={this.props.variance}
          initialValues={this.props.variance}
          removeDocument={this.handleRemoveDocument}
          varianceStatusOptionsHash={this.props.varianceStatusOptionsHash}
          complianceCodesHash={this.props.complianceCodesHash}
          documentCategoryOptionsHash={this.props.documentCategoryOptionsHash}
        />
      </LoadingWrapper>
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

export default connect(mapStateToProps, mapDispatchToProps)(EditVarianceModal);
