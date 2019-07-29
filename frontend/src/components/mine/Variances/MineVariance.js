import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import MineVarianceTable from "./MineVarianceTable";
import * as ModalContent from "@/constants/modalContent";
import { modalConfig } from "@/components/modalContent/config";
import * as Permission from "@/constants/permissions";
import * as Strings from "@/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import AddButton from "@/components/common/AddButton";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import NullScreen from "@/components/common/NullScreen";

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  approvedVariances: PropTypes.arrayOf(CustomPropTypes.variance).isRequired,
  varianceApplications: PropTypes.arrayOf(CustomPropTypes.variance).isRequired,
  createVariance: PropTypes.func.isRequired,
  addDocumentToVariance: PropTypes.func.isRequired,
  complianceCodes: CustomPropTypes.options.isRequired,
  complianceCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  fetchVariancesByMine: PropTypes.func.isRequired,
  inspectors: CustomPropTypes.groupOptions.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  varianceDocumentCategoryOptions: CustomPropTypes.options.isRequired,
  updateVariance: PropTypes.func.isRequired,
  varianceStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

export class MineVariance extends Component {
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
      .createVariance({ mineGuid: this.props.mine.mine_guid }, newValues)
      .then(async ({ data: { variance_guid } }) => {
        await Promise.all(
          Object.entries(files).map(([document_manager_guid, document_name]) =>
            this.props.addDocumentToVariance(
              { mineGuid: this.props.mine.mine_guid, varianceGuid: variance_guid },
              {
                document_manager_guid,
                document_name,
                variance_document_category_code,
              }
            )
          )
        );
        this.props.closeModal();
        this.props.fetchVariancesByMine({ mineGuid: this.props.mine.mine_guid });
      });
  };

  handleUpdateVariance = (files, variance, isApproved) => (values) => {
    // if the application isApproved, set issue_date to today and set expiry_date 5 years from today,
    // unless the user sets a custom expiry.
    const { variance_document_category_code } = values;
    const issue_date = isApproved ? moment().format("YYYY-MM-DD") : null;
    let expiry_date;
    if (isApproved) {
      expiry_date = values.expiry_date
        ? values.expiry_date
        : moment(issue_date, "YYYY-MM-DD").add(5, "years");
    }
    const newValues = { ...values, issue_date, expiry_date };
    const mineGuid = this.props.mine.mine_guid;
    const varianceGuid = variance.variance_guid;
    const codeLabel = this.props.complianceCodesHash[variance.compliance_article_id];
    this.props.updateVariance({ mineGuid, varianceGuid, codeLabel }, newValues).then(async () => {
      await Promise.all(
        Object.entries(files).map(([document_manager_guid, document_name]) =>
          this.props.addDocumentToVariance(
            { mineGuid: this.props.mine.mine_guid, varianceGuid },
            {
              document_manager_guid,
              document_name,
              variance_document_category_code,
            }
          )
        )
      );
      this.props.closeModal();
      this.props.fetchVariancesByMine({ mineGuid: this.props.mine.mine_guid });
    });
  };

  openEditVarianceModal = (variance) => {
    this.props.openModal({
      props: {
        onSubmit: this.handleUpdateVariance,
        title: this.props.complianceCodesHash[variance.compliance_article_id],
        mineGuid: this.props.mine.mine_guid,
        mineName: this.props.mine.mine_name,
        varianceGuid: variance.variance_guid,
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
      },
      content: modalConfig.VIEW_VARIANCE,
      isViewOnly: true,
    });
  };

  openVarianceModal(event) {
    event.preventDefault();
    this.props.openModal({
      props: {
        onSubmit: this.handleAddVariances,
        title: ModalContent.ADD_VARIANCE(this.props.mine.mine_name),
        mineGuid: this.props.mine.mine_guid,
        complianceCodes: this.props.complianceCodes,
        documentCategoryOptions: this.props.varianceDocumentCategoryOptions,
        inspectors: this.props.inspectors,
      },
      content: modalConfig.ADD_VARIANCE,
    });
  }

  renderVarianceTables = () =>
    this.props.varianceApplications.length > 0 || this.props.approvedVariances.length > 0 ? (
      <div>
        <br />
        <h4 className="uppercase">Variance Applications</h4>
        <br />
        <MineVarianceTable
          openEditVarianceModal={this.openEditVarianceModal}
          openViewVarianceModal={this.openViewVarianceModal}
          variances={this.props.varianceApplications}
          complianceCodesHash={this.props.complianceCodesHash}
          mine={this.props.mine}
          varianceStatusOptionsHash={this.props.varianceStatusOptionsHash}
          isApplication
        />
        <br />
        <h4 className="uppercase">Approved Variances</h4>
        <br />
        <MineVarianceTable
          openEditVarianceModal={this.openEditVarianceModal}
          openViewVarianceModal={this.openViewVarianceModal}
          variances={this.props.approvedVariances}
          complianceCodesHash={this.props.complianceCodesHash}
          varianceStatusOptionsHash={this.props.varianceStatusOptionsHash}
          mine={this.props.mine}
        />
      </div>
    ) : (
      <NullScreen type="variance" />
    );

  render() {
    return (
      <div>
        <div className="inline-flex flex-end">
          <AuthorizationWrapper permission={Permission.EDIT_VARIANCES}>
            <AddButton onClick={(event) => this.openVarianceModal(event)}>Add variance</AddButton>
          </AuthorizationWrapper>
        </div>
        {this.renderVarianceTables()}
      </div>
    );
  }
}

MineVariance.propTypes = propTypes;

export default MineVariance;
