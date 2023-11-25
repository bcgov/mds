import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { getVariance } from "@mds/common/redux/selectors/varianceSelectors";
import { getDropdownInspectors } from "@mds/common/redux/selectors/partiesSelectors";
import {
  getDropdownHSRCMComplianceCodes,
  getHSRCMComplianceCodesHash,
  getDropdownVarianceStatusOptions,
  getVarianceStatusOptionsHash,
  getDropdownVarianceDocumentCategoryOptions,
  getVarianceDocumentCategoryOptionsHash,
} from "@mds/common/redux/selectors/staticContentSelectors";
import {
  fetchVarianceById,
  removeDocumentFromVariance,
  fetchVariancesByMine,
} from "@mds/common/redux/actionCreators/varianceActionCreator";
import EditVarianceForm from "@/components/Forms/variances/EditVarianceForm";
import CustomPropTypes from "@/customPropTypes";
import LoadingWrapper from "../common/wrappers/LoadingWrapper";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  mineGuid: PropTypes.string.isRequired,
  mineName: PropTypes.string.isRequired,
  inspectors: CustomPropTypes.groupOptions.isRequired,
  variance: CustomPropTypes.variance,
  varianceStatusOptions: CustomPropTypes.options.isRequired,
  fetchVarianceById: PropTypes.func.isRequired,
  varianceGuid: PropTypes.string.isRequired,
  removeDocumentFromVariance: PropTypes.func.isRequired,
  varianceDocumentCategoryOptions: CustomPropTypes.options.isRequired,
  complianceCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  fetchVariancesByMine: PropTypes.func.isRequired,
  varianceDocumentCategoryOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
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
    return this.props
      .removeDocumentFromVariance(this.props.mineGuid, this.props.varianceGuid, documentGuid)
      .then(async () => {
        this.setState({ isLoaded: false });
        await Promise.all([
          this.props.fetchVarianceById(this.props.mineGuid, this.props.varianceGuid),
          this.props.fetchVariancesByMine({ mineGuid: this.props.mineGuid }),
        ]).finally(() => this.setState({ isLoaded: true }));
      });
  };

  render() {
    return (
      <LoadingWrapper condition={this.state.isLoaded}>
        <EditVarianceForm
          onSubmit={this.props.onSubmit}
          closeModal={this.props.closeModal}
          mineGuid={this.props.mineGuid}
          mineName={this.props.mineName}
          inspectors={this.props.inspectors}
          varianceDocumentCategoryOptions={this.props.varianceDocumentCategoryOptions}
          variance={this.props.variance}
          varianceStatusOptions={this.props.varianceStatusOptions}
          initialValues={this.props.variance}
          removeDocument={this.handleRemoveDocument}
          complianceCodesHash={this.props.complianceCodesHash}
          varianceDocumentCategoryOptionsHash={this.props.varianceDocumentCategoryOptionsHash}
        />
      </LoadingWrapper>
    );
  }
}

const mapStateToProps = (state) => ({
  variance: getVariance(state),
  varianceStatusOptions: getDropdownVarianceStatusOptions(state),
  inspectors: getDropdownInspectors(state),
  complianceCodesHash: getHSRCMComplianceCodesHash(state),
  varianceDocumentCategoryOptions: getDropdownVarianceDocumentCategoryOptions(state),
  varianceDocumentCategoryOptionsHash: getVarianceDocumentCategoryOptionsHash(state),
  varianceStatusOptionsHash: getVarianceStatusOptionsHash(state),
  complianceCodes: getDropdownHSRCMComplianceCodes(state),
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
