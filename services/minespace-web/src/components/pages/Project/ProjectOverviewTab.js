import React, { Component } from "react";
import { connect } from "react-redux";
import { Row, Col, Typography, Descriptions, Card } from "antd";
import PropTypes from "prop-types";
import { getEMLIContactsByRegion } from "@common/selectors/minespaceSelector";
import {
  getProjectSummaryDocumentTypesHash,
  getProjectSummaryStatusCodesHash,
  getInformationRequirementsTableStatusCodesHash,
  getMajorMinesApplicationStatusCodesHash,
} from "@common/selectors/staticContentSelectors";
import { detectProdEnvironment as IN_PROD } from "@common/utils/environmentUtils";
import {
  getProjectSummary,
  getProject,
  getInformationRequirementsTable,
} from "@common/selectors/projectSelectors";
import * as Strings from "@/constants/strings";
import { formatDate } from "@/utils/helpers";
import CustomPropTypes from "@/customPropTypes";
import DocumentTable from "@/components/common/DocumentTable";
import MinistryContactItem from "@/components/dashboard/mine/overview/MinistryContactItem";
import ProjectStagesTable from "../../dashboard/mine/projects/ProjectStagesTable";

const propTypes = {
  projectSummaryDocumentTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  projectSummaryStatusCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  EMLIcontactInfo: PropTypes.arrayOf(CustomPropTypes.EMLIContactInfo).isRequired,
  project: CustomPropTypes.project.isRequired,
  projectSummary: CustomPropTypes.projectSummary.isRequired,
  informationRequirementsTable: CustomPropTypes.informationRequirementsTable.isRequired,
  informationRequirementsTableStatusCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  irtNavigateTo: PropTypes.func.isRequired,
  majorMinesApplicationStatusCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

export class ProjectOverviewTab extends Component {
  renderProjectContactsCard = (contacts = []) => {
    return (
      <Card title="Project Contacts">
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
    const projectGuid = this.props.project.project_guid;
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
        required: null,
      },
      {
        title: "IRT",
        key: this.props.informationRequirementsTable.information_requirements_table_id,
        status: this.props.informationRequirementsTable.status_code,
        project_guid: projectGuid,
        payload: this.props.informationRequirementsTable,
        statusHash: this.props.informationRequirementsTableStatusCodesHash,
        required: this.props.project.mrc_review_required,
        navigateTo: () =>
          this.props.irtNavigateTo(this.props.informationRequirementsTable.status_code),
      },
    ];
    if (!IN_PROD()) {
      projectStages.push({
        title: "Application",
        key: this.props.project.major_mine_application?.major_mine_application_id,
        status: this.props.project.major_mine_application?.status_code,
        project_guid: projectGuid,
        payload: this.props.project.major_mine_application,
        statusHash: this.props.majorMinesApplicationStatusCodesHash,
        required: true,
      });
    }

    // TODO: Add in ToC here
    // if (!IN_PROD()) {
    //   projectStages.push({
    //     title: "TOC",
    //     key: ,
    //     status: ,
    //     project_guid: projectGuid,
    //     payload: ,
    //     statusHash: ,
    //     required: this.props.project.mrc_review_required,
    //   });
    // }

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
    );
  }
}

const mapStateToProps = (state) => ({
  project: getProject(state),
  projectSummary: getProjectSummary(state),
  projectSummaryDocumentTypesHash: getProjectSummaryDocumentTypesHash(state),
  projectSummaryStatusCodesHash: getProjectSummaryStatusCodesHash(state),
  informationRequirementsTable: getInformationRequirementsTable(state),
  informationRequirementsTableStatusCodesHash: getInformationRequirementsTableStatusCodesHash(
    state
  ),
  majorMinesApplicationStatusCodesHash: getMajorMinesApplicationStatusCodesHash(state),
  EMLIcontactInfo: getEMLIContactsByRegion(state),
});

ProjectOverviewTab.propTypes = propTypes;

export default connect(mapStateToProps, null)(ProjectOverviewTab);
