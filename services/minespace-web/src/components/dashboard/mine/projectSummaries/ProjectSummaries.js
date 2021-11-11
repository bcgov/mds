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
  fetchProjectSummariesByMine,
  createProjectSummary,
  addDocumentToProjectSummary,
  updateProjectSummary,
} from "@common/actionCreators/projectSummaryActionCreator";
import { getProjectSummaries } from "@common/selectors/projectSummarySelectors";
import {
  getProjectSummaryDocumentTypesHash,
  getProjectSummaryStatusCodesHash,
} from "@common/selectors/staticContentSelectors";
import { getInspectorsHash } from "@common/selectors/partiesSelectors";
import { modalConfig } from "@/components/modalContent/config";
import CustomPropTypes from "@/customPropTypes";
import ProjectSummariesTable from "@/components/dashboard/mine/projectSummaries/ProjectSummariesTable";

const propTypes = {
  mines: PropTypes.objectOf(CustomPropTypes.mine),
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  updateProjectSummary: PropTypes.func.isRequired,
  fetchProjectSummariesByMine: PropTypes.func.isRequired,
  projectSummaryStatusCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  projectSummaryDocumentTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  projectSummaries: PropTypes.arrayOf(CustomPropTypes.variance).isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  createProjectSummary: PropTypes.func.isRequired,
  addDocumentToProjectSummary: PropTypes.func.isRequired,
};

const defaultProps = {
  mines: {},
};

export class ProjectSummaries extends Component {
  state = { isLoaded: false, mine: {} };

  componentDidMount() {
    const { id } = this.props.match.params;
    this.props.fetchMineRecordById(id).then(() => {
      this.props.fetchProjectSummariesByMine({ mineGuid: id }).then(() => {
        this.setState({ isLoaded: true, mine: this.props.mines[id] });
      });
    });
  }

  handleAddDocuments = (files, projectSummaryGuid) =>
    Promise.all(
      Object.entries(files).map(([document_manager_guid, document_name]) =>
        this.props.addDocumentToProjectSummary(
          { mineGuid: this.state.mine.mine_guid, projectSummaryGuid },
          {
            project_summary_document_category_code: "GEN",
            document_manager_guid,
            document_name,
          }
        )
      )
    );

  handleCreateVariances = (files) => (values) => {
    const payload = { status_code: "O", ...values };
    return this.props
      .createProjectSummary(
        {
          mineGuid: this.state.mine.mine_guid,
          mineName: this.state.mine.mine_name,
        },
        payload
      )
      .then(async ({ data: { project_summary_guid } }) => {
        await this.handleAddDocuments(files, project_summary_guid);
        this.props.closeModal();
        this.props.fetchProjectSummariesByMine({ mineGuid: this.state.mine.mine_guid });
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
          <Button
            style={{ display: "inline", float: "right" }}
            type="primary"
            onClick={(event) => this.openCreateVarianceModal(event, this.state.mine.mine_name)}
          >
            <PlusCircleFilled />
            Create a new Project Summary
          </Button>
          <Typography.Title level={4}>Project Summaries</Typography.Title>
          <Typography.Paragraph>
            This table displays all of the&nbsp;
            <Typography.Text className="color-primary" strong>
              project summaries&nbsp;
            </Typography.Text>
            associated with this mine.
          </Typography.Paragraph>
          <ProjectSummariesTable
            projectSummaries={this.props.projectSummaries}
            mine={this.state.mine}
            isLoaded={this.state.isLoaded}
            projectSummaryStatusCodesHash={this.props.projectSummaryStatusCodesHash}
            projectSummaryDocumentTypesHash={this.props.projectSummaryDocumentTypesHash}
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
  projectSummaries: getProjectSummaries(state),
  projectSummaryStatusCodesHash: getProjectSummaryStatusCodesHash(state),
  projectSummaryDocmentTypesHash: getProjectSummaryDocumentTypesHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineRecordById,
      openModal,
      closeModal,
      fetchProjectSummariesByMine,
      createProjectSummary,
      updateProjectSummary,
      addDocumentToProjectSummary,
    },
    dispatch
  );

ProjectSummaries.propTypes = propTypes;
ProjectSummaries.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(ProjectSummaries);
