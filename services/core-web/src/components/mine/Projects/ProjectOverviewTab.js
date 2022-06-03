import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Row, Col, Typography, Descriptions, Card, Button } from "antd";
import PropTypes from "prop-types";
import {
  getProjectSummaryDocumentTypesHash,
  getProjectSummaryStatusCodesHash,
} from "@common/selectors/staticContentSelectors";
import { formatDate } from "@common/utils/helpers";
import * as Strings from "@common/constants/strings";
import * as routes from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";
import DocumentTable from "@/components/common/DocumentTable";
import { getProjectSummary, getProject } from "@common/selectors/projectSelectors";
import ProjectStagesTable from "./ProjectStagesTable";

const propTypes = {
  projectSummaryDocumentTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  projectSummaryStatusCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  project: CustomPropTypes.project.isRequired,
  projectSummary: CustomPropTypes.projectSummary.isRequired,
};

export class ProjectOverviewTab extends Component {
  renderProjectContactsCard = (contacts = []) => {
    return (
      <Card title="Project Contacts" headStyle={{ minHeight: "unset" }}>
        {contacts.map((c) => {
          const isPrimary = c.is_primary;
          const hasJobTitle = c.job_title;
          let title;
          if (isPrimary) {
            title = "Primary Contact";
          } else if (hasJobTitle) {
            title = c.job_title;
          }
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
    const {
      project_summary_description,
      expected_draft_irt_submission_date,
      expected_permit_application_date,
      expected_permit_receipt_date,
      expected_project_start_date,
      project_guid,
      project_summary_guid,
    } = this.props.project.project_summary;
    const projectStages = [
      {
        title: "Project description",
        key: this.props.project.project_summary.project_summary_id,
        status: this.props.project.project_summary.status_code,
        payload: this.props.project.project_summary,
        statusHash: this.props.projectSummaryStatusCodesHash,
        link: (
          <Link to={routes.PRE_APPLICATIONS.dynamicRoute(project_guid, project_summary_guid)}>
            <Button className="full-mobile margin-small" type="secondary">
              View
            </Button>
          </Link>
        ),
      },
    ];

    return (
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
                  {formatDate(expected_draft_irt_submission_date) || Strings.EMPTY_FIELD}
                </Descriptions.Item>
                <Descriptions.Item
                  span={12}
                  label="Desired date to receive permit/amendment(s)"
                  className="vertical-description"
                >
                  {formatDate(expected_permit_receipt_date) || Strings.EMPTY_FIELD}
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
                  {formatDate(expected_permit_application_date) || Strings.EMPTY_FIELD}
                </Descriptions.Item>
                <Descriptions.Item
                  span={12}
                  label="Anticipated work start"
                  className="vertical-description"
                >
                  {formatDate(expected_project_start_date) || Strings.EMPTY_FIELD}
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
          <Typography.Title level={4}>Project Stages</Typography.Title>
          <ProjectStagesTable projectStages={projectStages} />
          <br />
          <Typography.Title level={4}>Project Documents</Typography.Title>
          <DocumentTable
            documents={this.props.projectSummary.documents.reduce(
              (docs, doc) => [
                {
                  key: doc.mine_document_guid,
                  mine_document_guid: doc.mine_document_guid,
                  document_manager_guid: doc.document_manager_guid,
                  name: doc.document_name,
                  category: this.props.projectSummaryDocumentTypesHash[
                    doc.project_summary_document_type_code
                  ],
                  uploaded: doc.upload_date,
                },
                ...docs,
              ],
              []
            )}
            documentCategoryOptionsHash={this.props.projectSummaryDocumentTypesHash}
            documentParent="project summary"
            categoryDataIndex="project_summary_document_type_code"
            uploadDateIndex="upload_date"
            isViewOnly
          />
        </Col>
        <Col lg={{ span: 9, offset: 1 }} xl={{ span: 7, offset: 1 }}>
          <Row>
            <Col span={24}>{this.renderProjectContactsCard(this.props.project.contacts)}</Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = (state) => ({
  project: getProject(state),
  projectSummary: getProjectSummary(state),
  projectSummaryDocumentTypesHash: getProjectSummaryDocumentTypesHash(state),
  projectSummaryStatusCodesHash: getProjectSummaryStatusCodesHash(state),
});

ProjectOverviewTab.propTypes = propTypes;

export default connect(mapStateToProps, null)(ProjectOverviewTab);
