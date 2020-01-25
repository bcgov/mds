/* eslint-disable */

import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Button, Row, Col, Typography } from "antd";
import moment from "moment";
import PropTypes from "prop-types";
import { getMine } from "@/selectors/userMineSelectors";
import CustomPropTypes from "@/customPropTypes";
import { openModal, closeModal } from "@/actions/modalActions";
import { modalConfig } from "@/components/modalContent/config";
import { fetchMineRecordById } from "@/actionCreators/userDashboardActionCreator";
import {
  fetchVariancesByMine,
  fetchMineComplianceCodes,
  fetchVarianceStatusOptions,
  fetchVarianceDocumentCategoryOptions,
  createVariance,
  addDocumentToVariance,
  updateVariance,
} from "@/actionCreators/varianceActionCreator";
import {
  getVarianceApplications,
  getApprovedVariances,
  getVarianceStatusOptionsHash,
  getVarianceDocumentCategoryOptionsHash,
  getHSRCMComplianceCodesHash,
  getDropdownHSRCMComplianceCodes,
} from "@/selectors/varianceSelectors";
import VariancesTable from "@/components/dashboard/mine/variances/VariancesTable";

const { Paragraph, Title } = Typography;

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  updateVariance: PropTypes.func.isRequired,
  fetchVariancesByMine: PropTypes.func.isRequired,
  fetchMineComplianceCodes: PropTypes.func.isRequired,
  fetchVarianceStatusOptions: PropTypes.func.isRequired,
  fetchVarianceDocumentCategoryOptions: PropTypes.func.isRequired,
  complianceCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  complianceCodes: CustomPropTypes.options.isRequired,
  varianceStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  documentCategoryOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  approvedVariances: PropTypes.arrayOf(CustomPropTypes.variance).isRequired,
  varianceApplications: PropTypes.arrayOf(CustomPropTypes.variance).isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  createVariance: PropTypes.func.isRequired,
  addDocumentToVariance: PropTypes.func.isRequired,
};

const defaultProps = {};

export class Variances extends Component {
  state = { isLoaded: false };

  componentDidMount() {
    const { mine_guid } = this.props.mine;
    this.props.fetchMineRecordById(mine_guid).then(() => {
      this.setState({ isLoaded: true });
    });
    this.props.fetchVariancesByMine({ mineGuid: mine_guid });
    this.props.fetchMineComplianceCodes();
    this.props.fetchVarianceStatusOptions();
    this.props.fetchVarianceDocumentCategoryOptions();
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

  handleCreateVariances = (files) => (values) => {
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
        documentCategoryOptionsHash: this.props.documentCategoryOptionsHash,
        width: 650,
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
        documentCategoryOptionsHash: this.props.documentCategoryOptionsHash,
        width: 650,
      },
      content: modalConfig.VIEW_VARIANCE,
    });
  };

  openCreateVarianceModal(event, mineName) {
    event.preventDefault();
    this.props.openModal({
      props: {
        onSubmit: this.handleCreateVariances,
        title: "Create Variance Application",
        mineGuid: this.props.mine.mine_guid,
        complianceCodes: this.props.complianceCodes,
      },
      content: modalConfig.CREATE_VARIANCE,
    });
  }

  render() {
    return (
      <Row>
        <Col>
          <Title level={4}>Variance Details</Title>
          <Paragraph>
            Morbi consequat, augue et pulvinar condimentum, nunc urna congue diam, at tempus justo
            eros non leo.
          </Paragraph>
          <Button
            type="primary"
            onClick={(event) => this.openCreateVarianceModal(event, this.props.mine.mine_name)}
          >
            Create Variance
          </Button>
          <VariancesTable
            variances={this.props.varianceApplications}
            mine={this.props.mine}
            isApplication
            varianceStatusOptionsHash={this.props.varianceStatusOptionsHash}
            complianceCodesHash={this.props.complianceCodesHash}
            openViewVarianceModal={this.openViewVarianceModal}
            openEditVarianceModal={this.openEditVarianceModal}
          />
        </Col>
      </Row>
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
  documentCategoryOptionsHash: getVarianceDocumentCategoryOptionsHash(state),
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
      fetchVarianceDocumentCategoryOptions,
      createVariance,
      updateVariance,
      addDocumentToVariance,
    },
    dispatch
  );

Variances.propTypes = propTypes;
Variances.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(Variances);
