import React, { FC } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Row, Col, Typography, Descriptions, Card, Button } from "antd";
import {
  getProjectSummaryStatusCodesHash,
  getInformationRequirementsTableStatusCodesHash,
  getMajorMinesApplicationStatusCodesHash,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { getProjectLeads } from "@mds/common/redux/selectors/partiesSelectors";
import { formatDate } from "@common/utils/helpers";
import * as Strings from "@mds/common/constants/strings";
import { getProject } from "@mds/common/redux/selectors/projectSelectors";
import * as routes from "@/constants/routes";
import ProjectStagesTable from "./ProjectStagesTable";
import { Feature } from "@mds/common";
import ProjectLinks from "@mds/common/components/projectSummary/ProjectLinks";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";

export const ProjectOverviewTab: FC = () => {
  const project = useSelector(getProject);
  const projectSummaryStatusCodesHash = useSelector(getProjectSummaryStatusCodesHash);
  const majorMineApplicationStatusCodeHash = useSelector(getMajorMinesApplicationStatusCodesHash);
  const informationRequirementsTableStatusCodesHash = useSelector(
    getInformationRequirementsTableStatusCodesHash
  );
  const projectLeads = useSelector(getProjectLeads);

  const { isFeatureEnabled } = useFeatureFlag();
  const shouldDisplayLinkedProjects = isFeatureEnabled(Feature.MAJOR_PROJECT_LINK_PROJECTS);

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
  } = project.project_summary;

  const hasInformationRequirementsTable = Boolean(project.information_requirements_table?.irt_guid);

  const project_lead_contact =
    projectLeads?.filter((lead) => lead.party_guid.includes(project.project_lead_party_guid)) ?? [];

  if (project_lead_contact?.length > 0) {
    project_lead_contact[0].is_project_lead_contact = true;
  } else {
    project_lead_contact.push({ is_project_lead_contact: true, project_contact_guid: "n/a" });
  }

  const contactsAndProjectLead = [...project.contacts];
  contactsAndProjectLead.push(project_lead_contact[0]);

  const requiredProjectStages: any[] = [
    {
      title: "REQUIRED STAGES",
      key: "req-stages-id",
      status: "STATUS",
      isTitle: true,
    },
  ];

  let optionalProjectStages: any[] = [
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
      statusHash: projectSummaryStatusCodesHash,
      link: (
        <Link
          data-cy="project-description-view-link"
          to={
            project?.project_summary?.submission_date
              ? routes.EDIT_PROJECT.dynamicRoute(project_guid, "project-description")
              : routes.EDIT_PROJECT_SUMMARY.dynamicRoute(project_guid, project_summary_guid)
          }
        >
          <Button className="full-mobile margin-small">
            {project?.project_summary?.submission_date ? "View" : "Resume"}
          </Button>
        </Link>
      ),
    },
    {
      title: "Final Application",
      key: `ps-${project.major_mine_application.major_mine_application_id}`,
      status: project.major_mine_application.status_code,
      statusHash: majorMineApplicationStatusCodeHash,
      link: (
        <Link
          data-cy="final-application-view-link"
          to={routes.PROJECT_FINAL_APPLICATION.dynamicRoute(project_guid)}
        >
          <Button className="full-mobile margin-small">View</Button>
        </Link>
      ),
    }
  );

  const irt = {
    title: "Final IRT",
    key: `irt-${project.information_requirements_table?.irt_id || 0}`,
    status: project.information_requirements_table?.status_code,
    statusHash: informationRequirementsTableStatusCodesHash,
    link: (
      <Link
        data-cy="final-irt-view-link"
        to={routes.EDIT_PROJECT.dynamicRoute(project_guid, "information-requirements-table")}
      >
        <Button className="full-mobile margin-small" disabled={!hasInformationRequirementsTable}>
          View
        </Button>
      </Link>
    ),
  };

  if (project.mrc_review_required) {
    requiredProjectStages.push(irt);
  } else {
    optionalProjectStages.push({ ...irt, isOptional: true });
  }

  if (optionalProjectStages.length === 1) {
    optionalProjectStages = [];
  }

  const renderProjectContactsCard = (contacts = []) => {
    return (
      <Card title="Project Contacts" headStyle={{ minHeight: "unset" }}>
        {contacts.map((c) => {
          const isPrimary = c.is_primary;
          const hasJobTitle = c.job_title;
          const isProjectLeadContact = c.is_project_lead_contact;
          const name = [c?.first_name, c?.last_name].join(" ").trim();
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
              {c.is_project_lead_contact && !c.first_name ? (
                <Typography.Text>Project Lead has not been assigned</Typography.Text>
              ) : (
                <>
                  <Typography.Text>{name || Strings.EMPTY_FIELD}</Typography.Text>
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
        <ProjectStagesTable projectStages={[...requiredProjectStages, ...optionalProjectStages]} />
        <br />
        {shouldDisplayLinkedProjects && (
          <ProjectLinks
            tableOnly
            viewProject={(p) =>
              routes.EDIT_PROJECT_SUMMARY.dynamicRoute(p.project_guid, p.project_summary_guid)
            }
          />
        )}
      </Col>
      <Col lg={{ span: 9, offset: 1 }} xl={{ span: 7, offset: 1 }}>
        <Row>
          <Col span={24}>{renderProjectContactsCard(contactsAndProjectLead)}</Col>
        </Row>
      </Col>
    </Row>
  );
};

export default ProjectOverviewTab;
