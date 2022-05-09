import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Link } from "react-router-dom";
import { Row, Col, Typography, Tabs, Divider, Descriptions, Card } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { getMines } from "@common/selectors/mineSelectors";
import { getEMLIContactsByRegion } from "@common/selectors/minespaceSelector";
import {
  getProjectSummary,
  getFormattedProjectSummary,
  getProject,
} from "@common/selectors/projectSelectors";
import {
  getProjectSummaryDocumentTypesHash,
  getProjectSummaryAuthorizationTypesArray,
  getEMLIContactTypesHash,
  getProjectSummaryStatusCodesHash,
} from "@common/selectors/staticContentSelectors";
import { fetchProjectById } from "@common/actionCreators/projectActionCreator";
import { fetchMineRecordById } from "@common/actionCreators/mineActionCreator";
import { fetchEMLIContactsByRegion } from "@common/actionCreators/minespaceActionCreator";
import { clearProjectSummary, clearProject } from "@common/actions/projectActions";
import Loading from "@/components/common/Loading";
import * as Strings from "@/constants/strings";
import { formatDate } from "@/utils/helpers";
import CustomPropTypes from "@/customPropTypes";
import DocumentTable from "@/components/common/DocumentTable";
import MinistryContactItem from "@/components/dashboard/mine/overview/MinistryContactItem";
import ProjectStagesTable from "../../dashboard/mine/projects/ProjectStagesTable";

const propTypes = {
  mines: PropTypes.arrayOf(CustomPropTypes.mine).isRequired,
  projectSummary: CustomPropTypes.projectSummary,
  fetchProjectSummaryById: PropTypes.func.isRequired,
  createProjectSummary: PropTypes.func.isRequired,
  updateProjectSummary: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  fetchEMLIContactsByRegion: PropTypes.func.isRequired,
  clearProjectSummary: PropTypes.func.isRequired,
  clearProject: PropTypes.func.isRequired,
  projectSummaryDocumentTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  match: PropTypes.shape({
    params: {
      mineGuid: PropTypes.string,
    },
  }).isRequired,
  history: PropTypes.shape({ push: PropTypes.func, replace: PropTypes.func }).isRequired,
  submit: PropTypes.func.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  formValueSelector: PropTypes.func.isRequired,
  projectSummaryAuthorizationTypesArray: PropTypes.arrayOf(PropTypes.any).isRequired,
  formattedProjectSummary: PropTypes.objectOf(PropTypes.any).isRequired,
  location: PropTypes.shape({ pathname: PropTypes.string }).isRequired,
  EMLIcontactInfo: PropTypes.arrayOf(CustomPropTypes.EMLIContactInfo).isRequired,
};

const defaultProps = {
  project: {},
};

export class ProjectOverviewTab extends Component {
  state = {
    isLoaded: true,
  };

  renderProjectContactsCard = (contacts = []) => {
    return (
      <Card title="Project Contacts">
        {contacts.map((c) => {
          const isPrimary = c.is_primary;
          const hasJobTitle = c.job_title;
          const title = isPrimary ? "Primary Contact" : hasJobTitle ? c.job_title : null;
          return (
            <Typography.Paragraph className="ministry-contact-item" key={c.project_contact_guid}>
              {title && (
                <Typography.Text strong className="ministry-contact-title">
                  {title}
                </Typography.Text>
              )}
              <br />
              <Typography.Text>{c.name}</Typography.Text>
              <br />
              <Typography.Text>{c.phone_number}</Typography.Text>
              <br />
              <Typography.Text>
                <a href={`mailto:${c.email}`}>{c.email}</a>
              </Typography.Text>
            </Typography.Paragraph>
          );
        })}
      </Card>
    );
  };

  render() {
    const mineGuid = this.props.project.mine_guid;
    const {
      project_summary_description,
      expected_draft_irt_submission_date,
      expected_permit_application_date,
      expected_permit_receipt_date,
      expected_project_start_date,
    } = this.props.projectSummary;
    const projectStages = [
      {
        title: "Project description",
        key: this.props.projectSummary.project_summary_id,
        status: this.props.projectSummary.status_code,
        payload: this.props.projectSummary,
        statusHash: this.props.projectSummaryStatusCodesHash,
      },
    ];

    return (
      (this.state.isLoaded && (
        <>
          <Row gutter={[0, 16]}>
            <Col lg={{ span: 14 }} xl={{ span: 16 }}>
              <Typography.Title level={4}>Overview</Typography.Title>
              <Typography.Text strong>PROJECT DESCRIPTION</Typography.Text>
              <Typography.Paragraph>{project_summary_description}</Typography.Paragraph>
              <Typography.Text strong>KEY DATES</Typography.Text>
              <Row>
                <Col lg={12}>
                  <Descriptions column={2} layout="vertical">
                    <Descriptions.Item
                      span={12}
                      label="Estimated IRT Submission"
                      className="vertical-description"
                    >
                      {formatDate(expected_draft_irt_submission_date) || Strings.UNKNOWN}
                    </Descriptions.Item>
                    <Descriptions.Item
                      span={12}
                      label="Desired date to receive permit/amendment(s)"
                      className="vertical-description"
                    >
                      {formatDate(expected_permit_receipt_date) || Strings.UNKNOWN}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col lg={12}>
                  <Descriptions column={2} layout="vertical">
                    <Descriptions.Item
                      span={12}
                      label="Estimated Permit Application Submission"
                      className="vertical-description"
                    >
                      {formatDate(expected_permit_application_date) || Strings.UNKNOWN}
                    </Descriptions.Item>
                    <Descriptions.Item
                      span={12}
                      label="Anticipated work start"
                      className="vertical-description"
                    >
                      {formatDate(expected_project_start_date) || Strings.UNKNOWN}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
              <Typography.Title level={4}>Project Stages</Typography.Title>
              <ProjectStagesTable projectStages={projectStages} />
              <Typography.Title level={4}>Project Documents</Typography.Title>
              <DocumentTable
                documents={this.props.projectSummary.documents}
                documentCategoryOptionsHash={this.props.projectSummaryDocumentTypesHash}
                documentParent="project summary"
                categoryDataIndex="project_summary_document_type_code"
                uploadDateIndex="upload_date"
              />
            </Col>
            <Col lg={{ span: 9, offset: 1 }} xl={{ span: 7, offset: 1 }}>
              <Row gutter={[0, 16]}>
                <Col span={24}>{this.renderProjectContactsCard(this.props.project.contacts)}</Col>
                <Col span={24}>
                  <Card title="Ministry Contacts">
                    {this.props.EMLIcontactInfo.map((contact) => (
                      <MinistryContactItem contact={contact} key={contact.id} />
                    ))}
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        </>
      )) || <Loading />
    );
  }
}

const mapStateToProps = (state) => ({
  mines: getMines(state),
  project: getProject(state),
  projectSummary: getProjectSummary(state),
  formattedProjectSummary: getFormattedProjectSummary(state),
  projectSummaryDocumentTypesHash: getProjectSummaryDocumentTypesHash(state),
  projectSummaryAuthorizationTypesArray: getProjectSummaryAuthorizationTypesArray(state),
  projectSummaryStatusCodesHash: getProjectSummaryStatusCodesHash(state),
  EMLIcontactInfo: getEMLIContactsByRegion(state),
  EMLIContactTypesHash: getEMLIContactTypesHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineRecordById,
      clearProjectSummary,
      clearProject,
      fetchProjectById,
      fetchEMLIContactsByRegion,
    },
    dispatch
  );

ProjectOverviewTab.propTypes = propTypes;
ProjectOverviewTab.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(ProjectOverviewTab);
