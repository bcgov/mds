import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Row, Col, Typography, Button } from "antd";
import { PlusCircleFilled } from "@ant-design/icons";
import moment from "moment";
import PropTypes from "prop-types";
import { getMines } from "@common/selectors/mineSelectors";
import { openModal, closeModal } from "@common/actions/modalActions";
import { fetchMineRecordById } from "@common/actionCreators/mineActionCreator";
import {
  fetchVariancesByMine,
  createVariance,
  addDocumentToVariance,
  updateVariance,
} from "@common/actionCreators/varianceActionCreator";
import { getVariances } from "@common/selectors/varianceSelectors";
import {
  getVarianceStatusOptionsHash,
  getVarianceDocumentCategoryOptionsHash,
  getHSRCMComplianceCodesHash,
  getDropdownHSRCMComplianceCodes,
} from "@common/selectors/staticContentSelectors";
import { getInspectorsHash } from "@common/selectors/partiesSelectors";
import { modalConfig } from "@/components/modalContent/config";
import CustomPropTypes from "@/customPropTypes";
import VariancesTable from "@/components/dashboard/mine/variances/VariancesTable";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";

const propTypes = {
  mines: PropTypes.objectOf(CustomPropTypes.mine),
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }),
  }).isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  updateVariance: PropTypes.func.isRequired,
  fetchVariancesByMine: PropTypes.func.isRequired,
  complianceCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  complianceCodes: CustomPropTypes.options.isRequired,
  varianceStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  documentCategoryOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  variances: PropTypes.arrayOf(CustomPropTypes.variance).isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  createVariance: PropTypes.func.isRequired,
  addDocumentToVariance: PropTypes.func.isRequired,
  inspectorsHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

const defaultProps = {
  mines: {},
};

export class Variances extends Component {
  state = { isLoaded: false, mine: {} };

  componentDidMount() {
    const { id } = this.props.match.params;
    this.props.fetchMineRecordById(id).then(() => {
      this.props.fetchVariancesByMine({ mineGuid: id }).then(() => {
        this.setState({ isLoaded: true, mine: this.props.mines[id] });
      });
    });
  }

  handleAddDocuments = (files, varianceGuid) =>
    Promise.all(
      Object.entries(files).map(([document_manager_guid, document_name]) =>
        this.props.addDocumentToVariance(
          { mineGuid: this.state.mine.mine_guid, varianceGuid },
          {
            variance_document_category_code: "REQ",
            document_manager_guid,
            document_name,
          }
        )
      )
    );

  handleCreateVariances = (files) => (values) => {
    const received_date = moment().format("YYYY-MM-DD");
    const payload = { received_date, variance_application_status_code: "REV", ...values };
    return this.props
      .createVariance(
        {
          mineGuid: this.state.mine.mine_guid,
          mineName: this.state.mine.mine_name,
        },
        payload
      )
      .then(async ({ data: { variance_guid } }) => {
        await this.handleAddDocuments(files, variance_guid);
        this.props.closeModal();
        this.props.fetchVariancesByMine({ mineGuid: this.state.mine.mine_guid });
      });
  };

  handleUpdateVariance = (files, varianceGuid, codeLabel) =>
    this.props
      .updateVariance({ mineGuid: this.state.mine.mine_guid, varianceGuid, codeLabel })
      .then(async () => {
        await this.handleAddDocuments(files, varianceGuid);
        this.props.fetchVariancesByMine({ mineGuid: this.state.mine.mine_guid });
        this.props.closeModal();
      });

  openEditVarianceModal = (variance) => {
    this.props.openModal({
      props: {
        onSubmit: this.handleUpdateVariance,
        title: "Edit Variance",
        mineGuid: this.state.mine.mine_guid,
        mineName: this.state.mine.mine_name,
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
        title: "View Variance",
        mineName: this.state.mine.mine_name,
        varianceStatusOptionsHash: this.props.varianceStatusOptionsHash,
        complianceCodesHash: this.props.complianceCodesHash,
        documentCategoryOptionsHash: this.props.documentCategoryOptionsHash,
        width: 650,
      },
      content: modalConfig.VIEW_VARIANCE,
    });
  };

  openCreateVarianceModal(event) {
    event.preventDefault();
    this.props.openModal({
      props: {
        onSubmit: this.handleCreateVariances,
        title: "Apply for a Variance",
        mineGuid: this.state.mine.mine_guid,
        complianceCodes: this.props.complianceCodes,
      },
      content: modalConfig.ADD_VARIANCE,
    });
  }

  render() {
    return (
      <Row>
        <Col span={24}>
          <AuthorizationWrapper>
            <Button
              style={{ display: "inline", float: "right" }}
              type="primary"
              onClick={(event) => this.openCreateVarianceModal(event, this.state.mine.mine_name)}
            >
              <PlusCircleFilled />
              Apply for a Variance
            </Button>
          </AuthorizationWrapper>
          <Typography.Title level={4}>Variances</Typography.Title>
          <Typography.Paragraph>
            This table shows your mine&apos;s&nbsp;
            <Typography.Text className="color-primary" strong>
              variance history
            </Typography.Text>
            , including applications in progress and variances you may need to renew.
          </Typography.Paragraph>
          <VariancesTable
            variances={this.props.variances}
            mine={this.state.mine}
            isLoaded={this.state.isLoaded}
            varianceStatusOptionsHash={this.props.varianceStatusOptionsHash}
            complianceCodesHash={this.props.complianceCodesHash}
            openViewVarianceModal={this.openViewVarianceModal}
            openEditVarianceModal={this.openEditVarianceModal}
            inspectorsHash={this.props.inspectorsHash}
          />
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = (state) => ({
  mines: getMines(state),
  variances: getVariances(state),
  inspectorsHash: getInspectorsHash(state),
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
      createVariance,
      updateVariance,
      addDocumentToVariance,
    },
    dispatch
  );

Variances.propTypes = propTypes;
Variances.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(Variances);
