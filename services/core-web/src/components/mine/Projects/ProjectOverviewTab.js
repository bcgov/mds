import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Row, Col, Typography, Descriptions, Card, Button } from "antd";
import PropTypes from "prop-types";
import {
  getProjectSummaryDocumentTypesHash,
  getProjectSummaryStatusCodesHash,
  getInformationRequirementsTableStatusCodesHash,
  getMajorMinesApplicationStatusCodesHash,
} from "@common/selectors/staticContentSelectors";
import { getProjectLeads } from "@common/selectors/partiesSelectors";
import { formatDate } from "@common/utils/helpers";
import * as Strings from "@common/constants/strings";
import { getProject } from "@common/selectors/projectSelectors";
import * as routes from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";
import ProjectStagesTable from "./ProjectStagesTable";

const propTypes = {
  informationRequirementsTableStatusCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  projectSummaryStatusCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  majorMineApplicationStatusCodeHash: PropTypes.objectOf(PropTypes.string).isRequired,
  project: CustomPropTypes.project.isRequired,
  projectLeads: CustomPropTypes.projectContact.isRequired,
};

export class ProjectOverviewTab extends Component {
  renderProjectContactsCard = (contacts = []) => {
    return (
      <Card title="Project Contacts" headStyle={{ minHeight: "unset" }}>
        {contacts.map((c) => {
          const isPrimary = c.is_primary;
          const hasJobTitle = c.job_title;
          const isProjectLeadContact = c.is_project_lead_contact;
          let title;
          if (isProjectLeadContact) {
            title = "EMLI Project Lead";
          } else if (isPrimary) {
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
              {c.is_project_lead_contact && !c.name ? (
                <Typography.Text>Project Lead has not been assigned</Typography.Text>
              ) : (
                <>
                  <Typography.Text>{c.name}</Typography.Text>
                  <br />
                  <Typography.Text>{c.phone_no || c.phone_number}</Typography.Text>
                  <br />
                  {c.email && (
                    <Typography.Text>
                      <a href={`mailto:${c.email}`}>{c.email}</a>
                    </Typography.Text>
                  )}
                </>
              )}
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
      project_summary_id,
      project_summary_guid,
      status_code,
    } = this.props.project.project_summary;

    const hasInformationRequirementsTable = Boolean(
      this.props.project.information_requirements_table?.irt_guid
    );

    const project_lead_contact =
      this.props.projectLeads?.filter((lead) =>
        lead.party_guid.includes(this.props.project.project_lead_party_guid)
      ) ?? [];
    if (project_lead_contact?.length > 0) {
      project_lead_contact[0].is_project_lead_contact = true;
    } else {
      project_lead_contact.push({ is_project_lead_contact: true });
    }

    const contactsAndProjectLead = [...this.props.project.contacts];
    contactsAndProjectLead.push(project_lead_contact[0]);

    const requiredProjectStages = [
      {
        title: "REQUIRED STAGES",
        key: "req-stages-id",
        status: "STATUS",
        isTitle: true,
      },
    ];

    let optionalProjectStages = [
      {
        title: "OPTIONAL STAGES",
        key: "opt-stages-id",
        status: "STATUS",
        isOptional: true,
        isTitle: true,
      },
    ];

    requiredProjectStages.push(
      {
        title: "Project description",
        key: `ps-${project_summary_id}`,
        status: status_code,
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
      {
        title: "Final Application",
        key: `ps-${this.props.project.major_mine_application.major_mine_application_id}`,
        status: this.props.project.major_mine_application.status_code,
        payload: this.props.project.major_mine_application,
        statusHash: this.props.majorMineApplicationStatusCodeHash,
        link: (
          <Link to={routes.PROJECT_FINAL_APPLICATION.dynamicRoute(project_guid)}>
            <Button className="full-mobile margin-small" type="secondary">
              View
            </Button>
          </Link>
        ),
      }
    );

    const irt = {
      title: "Final IRT",
      key: `irt-${this.props.project.information_requirements_table?.irt_id || 0}`,
      status: this.props.project.information_requirements_table?.status_code,
      payload: this.props.project.information_requirements_table,
      statusHash: this.props.informationRequirementsTableStatusCodesHash,
      link: (
        <Link
          to={routes.INFORMATION_REQUIREMENTS_TABLE.dynamicRoute(
            project_guid,
            this.props.project.information_requirements_table.irt_guid
          )}
        >
          <Button
            className="full-mobile margin-small"
            type="secondary"
            disabled={!hasInformationRequirementsTable}
          >
            View
          </Button>
        </Link>
      ),
    };

    if (this.props.project.mrc_review_required) {
      requiredProjectStages.push(irt);
    } else {
      optionalProjectStages.push({ ...irt, isOptional: true });
    }

    if (optionalProjectStages.length === 1) {
      optionalProjectStages = [];
    }

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
          <ProjectStagesTable
            projectStages={[...requiredProjectStages, ...optionalProjectStages]}
          />
          <br />
        </Col>
        <Col lg={{ span: 9, offset: 1 }} xl={{ span: 7, offset: 1 }}>
          <Row>
            <Col span={24}>{this.renderProjectContactsCard(contactsAndProjectLead)}</Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = (state) => ({
  project: getProject(state),
  projectSummaryDocumentTypesHash: getProjectSummaryDocumentTypesHash(state),
  projectSummaryStatusCodesHash: getProjectSummaryStatusCodesHash(state),
  majorMineApplicationStatusCodeHash: getMajorMinesApplicationStatusCodesHash(state),
  informationRequirementsTableStatusCodesHash: getInformationRequirementsTableStatusCodesHash(
    state
  ),
  projectLeads: getProjectLeads(state),
});

ProjectOverviewTab.propTypes = propTypes;

export default connect(mapStateToProps, null)(ProjectOverviewTab);
