import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Row, Col, Typography } from "antd";
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
import {
  fetchMineComplianceCodes,
  fetchVarianceStatusOptions,
  fetchVarianceDocumentCategoryOptions,
} from "@common/actionCreators/staticContentActionCreator";
import { getVariances } from "@common/selectors/varianceSelectors";
import {
  getVarianceStatusOptionsHash,
  getVarianceDocumentCategoryOptionsHash,
  getHSRCMComplianceCodesHash,
  getDropdownHSRCMComplianceCodes,
} from "@common/selectors/staticContentSelectors";
import { modalConfig } from "@/components/modalContent/config";
import CustomPropTypes from "@/customPropTypes";
import VariancesTable from "@/components/dashboard/mine/variances/VariancesTable";

const { Paragraph, Title, Text } = Typography;

const propTypes = {
  mines: PropTypes.objectOf(CustomPropTypes.mine),
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
  fetchVarianceDocumentCategoryOptions: PropTypes.func.isRequired,
  complianceCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  complianceCodes: CustomPropTypes.options.isRequired,
  varianceStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  documentCategoryOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  variances: PropTypes.arrayOf(CustomPropTypes.variance).isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  createVariance: PropTypes.func.isRequired,
  addDocumentToVariance: PropTypes.func.isRequired,
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
    this.props.fetchMineComplianceCodes();
    this.props.fetchVarianceStatusOptions();
    this.props.fetchVarianceDocumentCategoryOptions();
  }

  handleAddDocuments = (files, varianceGuid) =>
    Promise.all(
      Object.entries(files).map(([document_manager_guid, document_name]) =>
        this.props.addDocumentToVariance(
          { mineGuid: this.state.mine.mine_guid, varianceGuid },
          {
            document_manager_guid,
            document_name,
          }
        )
      )
    );

  handleCreateVariances = (files) => (values) => {
    const received_date = moment().format("YYYY-MM-DD");
    const payload = { received_date, ...values };
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
        title: "Edit Variance Application",
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
        title: "View Variance Application",
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
        title: "Create Variance Application",
        mineGuid: this.state.mine.mine_guid,
        complianceCodes: this.props.complianceCodes,
      },
      content: modalConfig.ADD_VARIANCE,
    });
  }

  render() {
    return (
      <Row>
        <Col>
          {/* Disabled for now, until we want variance creation enabled. */}
          {/* <Button
            style={{ display: "inline", float: "right" }}
            type="primary"
            onClick={(event) => this.openCreateVarianceModal(event, this.state.mine.mine_name)}
          >
            <Icon type="plus-circle" theme="filled" />
            Create Variance
          </Button> */}
          <Title level={4}>Variances</Title>
          <Paragraph>
            This table shows your mine&apos;s&nbsp;
            <Text className="color-primary" strong>
              variance history
            </Text>
            , including applications in progress and variances you may need to renew.
          </Paragraph>
          <VariancesTable
            variances={this.props.variances}
            mine={this.state.mine}
            isLoaded={this.state.isLoaded}
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
  mines: getMines(state),
  variances: getVariances(state),
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
