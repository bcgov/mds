import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Divider } from "antd";
import moment from "moment";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import {
  createVariance,
  fetchVariancesByMine,
  addDocumentToVariance,
  updateVariance,
  deleteVariance,
} from "@mds/common/redux/actionCreators/varianceActionCreator";
import { getMines, getMineGuid } from "@mds/common/redux/selectors/mineSelectors";
import {
  getDropdownHSRCMComplianceCodes,
  getHSRCMComplianceCodesHash,
  getDropdownVarianceStatusOptions,
  getVarianceStatusOptionsHash,
  getDropdownVarianceDocumentCategoryOptions,
  getVarianceDocumentCategoryOptionsHash,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { getVarianceApplications, getApprovedVariances } from "@mds/common/redux/selectors/varianceSelectors";
import { getDropdownInspectors, getInspectorsHash } from "@mds/common/redux/selectors/partiesSelectors";
import * as Strings from "@common/constants/strings";
import MineVarianceTable from "./MineVarianceTable";
import * as ModalContent from "@/constants/modalContent";
import { modalConfig } from "@/components/modalContent/config";
import * as Permission from "@/constants/permissions";
import CustomPropTypes from "@/customPropTypes";
import AddButton from "@/components/common/buttons/AddButton";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";

const propTypes = {
  mines: PropTypes.objectOf(CustomPropTypes.mine).isRequired,
  mineGuid: PropTypes.string.isRequired,
  approvedVariances: PropTypes.arrayOf(CustomPropTypes.variance).isRequired,
  varianceApplications: PropTypes.arrayOf(CustomPropTypes.variance).isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  fetchVariancesByMine: PropTypes.func.isRequired,
  createVariance: PropTypes.func.isRequired,
  updateVariance: PropTypes.func.isRequired,
  deleteVariance: PropTypes.func.isRequired,
  addDocumentToVariance: PropTypes.func.isRequired,
  complianceCodes: CustomPropTypes.options.isRequired,
  complianceCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  inspectors: CustomPropTypes.groupOptions.isRequired,
  varianceDocumentCategoryOptions: CustomPropTypes.options.isRequired,
  varianceStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

export class MineVariance extends Component {
  state = {
    isLoaded: false,
  };

  componentDidMount() {
    this.props.fetchVariancesByMine({ mineGuid: this.props.mineGuid }).then(() => {
      this.setState({ isLoaded: true });
    });
  }

  handleDeleteVariance = (variance) => {
    return this.props.deleteVariance(variance.mine_guid, variance.variance_guid).then(() => {
      this.props.fetchVariancesByMine({ mineGuid: this.props.mineGuid });
    });
  };

  handleAddVariances = (files, isApplication) => (values) => {
    const { variance_document_category_code } = values;
    const variance_application_status_code = isApplication
      ? Strings.VARIANCE_APPLICATION_CODE
      : Strings.VARIANCE_APPROVED_CODE;
    const received_date = values.received_date
      ? values.received_date
      : moment().format("YYYY-MM-DD");
    const newValues = { received_date, variance_application_status_code, ...values };
    return this.props
      .createVariance({ mineGuid: this.props.mineGuid }, newValues)
      .then(async ({ data: { variance_guid } }) => {
        await Promise.all(
          Object.entries(files).map(([document_manager_guid, document_name]) =>
            this.props.addDocumentToVariance(
              { mineGuid: this.props.mineGuid, varianceGuid: variance_guid },
              {
                document_manager_guid,
                document_name,
                variance_document_category_code,
              }
            )
          )
        ).then(() => {
          this.props.closeModal();
          this.setState({ isLoaded: false });
          this.props
            .fetchVariancesByMine({ mineGuid: this.props.mineGuid })
            .then(() => this.setState({ isLoaded: true }));
        });
      });
  };

  handleUpdateVariance = (files, variance, isApproved) => (values) => {
    // If the application is approved, set the issue date to today and set the expiry date to 5 years from today if it is empty.
    const { variance_document_category_code } = values;
    let expiry_date;
    let issue_date;
    if (isApproved) {
      issue_date = values.issue_date ? values.issue_date : moment().format("YYYY-MM-DD");
      expiry_date = values.expiry_date
        ? values.expiry_date
        : moment(issue_date, "YYYY-MM-DD").add(5, "years");
    }
    const varianceGuid = variance.variance_guid;
    const codeLabel = this.props.complianceCodesHash[variance.compliance_article_id];
    return this.props
      .updateVariance(
        { mineGuid: this.props.mineGuid, varianceGuid, codeLabel },
        { ...values, issue_date, expiry_date }
      )
      .then(async () => {
        await Promise.all(
          Object.entries(files).map(([document_manager_guid, document_name]) =>
            this.props.addDocumentToVariance(
              { mineGuid: this.props.mineGuid, varianceGuid },
              {
                document_manager_guid,
                document_name,
                variance_document_category_code,
              }
            )
          )
        );
      })
      .then(() => {
        this.props.closeModal();
        this.setState({ isLoaded: false });
        this.props
          .fetchVariancesByMine({ mineGuid: this.props.mineGuid })
          .then(() => this.setState({ isLoaded: true }));
      });
  };

  openEditVarianceModal = (variance) => {
    const mine = this.props.mines[this.props.mineGuid];
    this.props.openModal({
      props: {
        onSubmit: this.handleUpdateVariance,
        title: this.props.complianceCodesHash[variance.compliance_article_id],
        mineGuid: mine.mine_guid,
        mineName: mine.mine_name,
        varianceGuid: variance.variance_guid,
      },
      content: modalConfig.EDIT_VARIANCE,
    });
  };

  openViewVarianceModal = (variance) => {
    const mine = this.props.mines[this.props.mineGuid];
    this.props.openModal({
      props: {
        variance,
        title: this.props.complianceCodesHash[variance.compliance_article_id],
        mineName: mine.mine_name,
      },
      content: modalConfig.VIEW_VARIANCE,
      isViewOnly: true,
    });
  };

  openVarianceModal(event, mine) {
    event.preventDefault();
    this.props.openModal({
      props: {
        onSubmit: this.handleAddVariances,
        title: ModalContent.ADD_VARIANCE(mine.mine_name),
        mineGuid: mine.mine_guid,
        complianceCodes: this.props.complianceCodes,
        documentCategoryOptions: this.props.varianceDocumentCategoryOptions,
        inspectors: this.props.inspectors,
      },
      content: modalConfig.ADD_VARIANCE,
    });
  }

  renderVarianceTables = (mine) => (
    <div>
      <br />
      <h4 className="uppercase">Variance Applications</h4>
      <br />
      <MineVarianceTable
        isLoaded={this.state.isLoaded}
        openEditVarianceModal={this.openEditVarianceModal}
        openViewVarianceModal={this.openViewVarianceModal}
        variances={this.props.varianceApplications}
        complianceCodesHash={this.props.complianceCodesHash}
        mine={mine}
        varianceStatusOptionsHash={this.props.varianceStatusOptionsHash}
        isApplication
        handleDeleteVariance={this.handleDeleteVariance}
      />
      <br />
      <h4 className="uppercase">Approved Variances</h4>
      <br />
      <MineVarianceTable
        isLoaded={this.state.isLoaded}
        openEditVarianceModal={this.openEditVarianceModal}
        openViewVarianceModal={this.openViewVarianceModal}
        variances={this.props.approvedVariances}
        complianceCodesHash={this.props.complianceCodesHash}
        varianceStatusOptionsHash={this.props.varianceStatusOptionsHash}
        mine={mine}
        handleDeleteVariance={this.handleDeleteVariance}
      />
    </div>
  );

  render() {
    const mine = this.props.mines[this.props.mineGuid];
    return (
      <div className="tab__content">
        <div>
          <h2>Variances</h2>
          <Divider />
        </div>
        <div className="inline-flex flex-end">
          <AuthorizationWrapper permission={Permission.EDIT_VARIANCES}>
            <AddButton onClick={(event) => this.openVarianceModal(event, mine)}>
              Add Variance
            </AddButton>
          </AuthorizationWrapper>
        </div>
        {this.renderVarianceTables(mine)}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mines: getMines(state),
  mineGuid: getMineGuid(state),
  inspectors: getDropdownInspectors(state),
  inspectorsHash: getInspectorsHash(state),
  varianceStatusOptions: getDropdownVarianceStatusOptions(state),
  varianceStatusOptionsHash: getVarianceStatusOptionsHash(state),
  complianceCodes: getDropdownHSRCMComplianceCodes(state),
  complianceCodesHash: getHSRCMComplianceCodesHash(state),
  approvedVariances: getApprovedVariances(state),
  varianceApplications: getVarianceApplications(state),
  varianceDocumentCategoryOptions: getDropdownVarianceDocumentCategoryOptions(state),
  varianceDocumentCategoryOptionsHash: getVarianceDocumentCategoryOptionsHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createVariance,
      fetchVariancesByMine,
      addDocumentToVariance,
      updateVariance,
      deleteVariance,
      openModal,
      closeModal,
    },
    dispatch
  );

MineVariance.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(MineVariance);
