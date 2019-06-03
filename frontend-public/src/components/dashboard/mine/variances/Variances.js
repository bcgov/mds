import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Button } from "antd";
import moment from "moment";
import PropTypes from "prop-types";
import { getMine } from "@/selectors/userMineSelectors";
import CustomPropTypes from "@/customPropTypes";
import Loading from "@/components/common/Loading";
import { openModal, closeModal } from "@/actions/modalActions";
import * as ModalContent from "@/constants/modalContent";
import { modalConfig } from "@/components/modalContent/config";
import { fetchMineRecordById } from "@/actionCreators/userDashboardActionCreator";
import {
  fetchVariancesByMine,
  fetchMineComplianceCodes,
  fetchVarianceStatusOptions,
  createVariance,
  addDocumentToVariance,
  updateVariance,
} from "@/actionCreators/varianceActionCreator";
import {
  getVarianceApplications,
  getApprovedVariances,
  getVarianceStatusOptionsHash,
  getHSRCMComplianceCodesHash,
  getDropdownHSRCMComplianceCodes,
} from "@/selectors/varianceSelectors";
import VarianceTable from "@/components/dashboard/mine/variances/VarianceTable";

const propTypes = {
  mine: CustomPropTypes.mine,
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  updateVariance: PropTypes.func.isRequired,
  fetchVariancesByMine: PropTypes.func.isRequired,
  fetchMineComplianceCodes: PropTypes.func.isRequired,
  fetchVarianceStatusOptions: PropTypes.func.isRequired,
  complianceCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  complianceCodes: CustomPropTypes.options.isRequired,
  varianceStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  approvedVariances: PropTypes.arrayOf(CustomPropTypes.variance).isRequired,
  varianceApplications: PropTypes.arrayOf(CustomPropTypes.variance).isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  createVariance: PropTypes.func.isRequired,
  addDocumentToVariance: PropTypes.func.isRequired,
};

const defaultProps = {
  mine: {},
};

export class Variances extends Component {
  state = { isLoaded: false };

  componentDidMount() {
    const { id } = this.props.match.params;
    this.props.fetchMineRecordById(id).then(() => {
      this.setState({ isLoaded: true });
    });
    this.props.fetchVariancesByMine({ mineGuid: id });
    this.props.fetchMineComplianceCodes();
    this.props.fetchVarianceStatusOptions();
  }

  handleAddDocuments = (files, varianceGuid) =>
    Promise.all(
      Object.entries(files).map(([document_manager_guid, document_name]) =>
        this.props.addDocumentToVariance(
          { mineGuid: this.props.mine.mine_guid, varianceGuid },
          {
            document_manager_guid,
            document_name,
          }
        )
      )
    );

  handleAddVariances = (files) => (values) => {
    const received_date = moment().format("YYYY-MM-DD");
    const newValues = { received_date, ...values };
    return this.props
      .createVariance(
        { mineGuid: this.props.mine.mine_guid, mineName: this.props.mine.mine_name },
        newValues
      )
      .then(async ({ data: { variance_guid } }) => {
        await this.handleAddDocuments(files, variance_guid);
        this.props.closeModal();
        this.props.fetchVariancesByMine({ mineGuid: this.props.mine.mine_guid });
      });
  };

  handleUpdateVariance = (files, varianceGuid, codeLabel) =>
    this.props
      .updateVariance({ mineGuid: this.props.mine.mine_guid, varianceGuid, codeLabel })
      .then(async () => {
        await this.handleAddDocuments(files, varianceGuid);
        this.props.fetchVariancesByMine({ mineGuid: this.props.mine.mine_guid });
        this.props.closeModal();
      });

  openEditVarianceModal = (variance) => {
    this.props.openModal({
      props: {
        onSubmit: this.handleUpdateVariance,
        title: this.props.complianceCodesHash[variance.compliance_article_id],
        mineGuid: this.props.mine.mine_guid,
        mineName: this.props.mine.mine_name,
        varianceGuid: variance.variance_guid,
        varianceStatusOptionsHash: this.props.varianceStatusOptionsHash,
        complianceCodesHash: this.props.complianceCodesHash,
      },
      content: modalConfig.EDIT_VARIANCE,
    });
  };

  openViewVarianceModal = (variance) => {
    this.props.openModal({
      props: {
        variance,
        title: this.props.complianceCodesHash[variance.compliance_article_id],
        mineName: this.props.mine.mine_name,
        varianceStatusOptionsHash: this.props.varianceStatusOptionsHash,
        complianceCodesHash: this.props.complianceCodesHash,
      },
      content: modalConfig.VIEW_VARIANCE,
    });
  };

  openVarianceModal(event, mineName) {
    event.preventDefault();
    this.props.openModal({
      props: {
        onSubmit: this.handleAddVariances,
        title: ModalContent.ADD_VARIANCE(mineName),
        mineGuid: this.props.mine.mine_guid,
        complianceCodes: this.props.complianceCodes,
      },
      content: modalConfig.ADD_VARIANCE,
    });
  }

  render() {
    if (!this.state.isLoaded) {
      return <Loading />;
    }

    return (
      <div className="mine-info-padding">
        {this.props.mine && (
          <div>
            <h1 className="mine-title">{this.props.mine.mine_name}</h1>
            <p>Mine No. {this.props.mine.mine_no}</p>
            <br />
            <div className="inline-flex between">
              <h2>Variance Applications</h2>
              <Button
                type="primary"
                onClick={(event) => this.openVarianceModal(event, this.props.mine.mine_name)}
              >
                Apply for Variance
              </Button>
            </div>
            <VarianceTable
              variances={this.props.varianceApplications}
              isApplication
              mine={this.props.mine}
              varianceStatusOptionsHash={this.props.varianceStatusOptionsHash}
              complianceCodesHash={this.props.complianceCodesHash}
              openViewVarianceModal={this.openViewVarianceModal}
              openEditVarianceModal={this.openEditVarianceModal}
            />
            <h2>Approved Variances</h2>
            <VarianceTable
              variances={this.props.approvedVariances}
              mine={this.props.mine}
              varianceStatusOptionsHash={this.props.varianceStatusOptionsHash}
              complianceCodesHash={this.props.complianceCodesHash}
              openViewVarianceModal={this.openViewVarianceModal}
            />
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mine: getMine(state),
  varianceApplications: getVarianceApplications(state),
  approvedVariances: getApprovedVariances(state),
  complianceCodesHash: getHSRCMComplianceCodesHash(state),
  complianceCodes: getDropdownHSRCMComplianceCodes(state),
  varianceStatusOptionsHash: getVarianceStatusOptionsHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineRecordById,
      openModal,
      closeModal,
      fetchVariancesByMine,
      fetchMineComplianceCodes,
      fetchVarianceStatusOptions,
      createVariance,
      updateVariance,
      addDocumentToVariance,
    },
    dispatch
  );

Variances.propTypes = propTypes;
Variances.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Variances);
