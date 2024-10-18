import React, { FC } from "react";
import { useSelector } from "react-redux";
import { Card, Col, Descriptions, Row, Typography } from "antd";
import { getEMLIContactsByRegion } from "@mds/common/redux/selectors/minespaceSelector";
import {
  getInformationRequirementsTableStatusCodesHash,
  getMajorMinesApplicationStatusCodesHash,
  getProjectSummaryStatusCodesHash,
} from "@mds/common/redux/selectors/staticContentSelectors";
import {
  getInformationRequirementsTable,
  getMajorMinesApplication,
  getProject,
  getProjectSummary,
} from "@mds/common/redux/selectors/projectSelectors";
import MinistryContactItem from "@/components/dashboard/mine/overview/MinistryContactItem";
import { EMPTY_FIELD, UNKNOWN } from "@mds/common";
import { formatDate } from "@common/utils/helpers";
import ProjectStagesTable from "@/components/dashboard/mine/projects/ProjectStagesTable";

interface ProjectOverviewTabProps {
  navigateForward: (source: string, status?: string) => void;
}

export const ProjectOverviewTab: FC<ProjectOverviewTabProps> = ({ navigateForward }) => {
  const projectSummary = useSelector(getProjectSummary);
  const EMLIcontactInfo = useSelector(getEMLIContactsByRegion);
  const project = useSelector(getProject);
  const projectSummaryStatusCodesHash = useSelector(getProjectSummaryStatusCodesHash);
  const informationRequirementsTable = useSelector(getInformationRequirementsTable);
  const informationRequirementsTableStatusCodesHash = useSelector(
    getInformationRequirementsTableStatusCodesHash
  );
  const majorMinesApplication = useSelector(getMajorMinesApplication);
  const majorMinesApplicationStatusCodesHash = useSelector(getMajorMinesApplicationStatusCodesHash);

  const renderProjectContactsCard = (contacts = []) => {
    return (
      <Card title="Project Contacts">
        {contacts.map((c) => {
          const isPrimary = c.is_primary;
          const hasJobTitle = c.job_title;
          const name = [c?.first_name, c?.last_name].join(" ").trim();
          let title: string;
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
              <Typography.Text>{name || EMPTY_FIELD}</Typography.Text>
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

  const projectGuid = project.project_guid;
  const {
    project_summary_description,
    expected_draft_irt_submission_date,
    expected_permit_application_date,
    expected_permit_receipt_date,
    expected_project_start_date,
  } = projectSummary;

  const projectStages = [
    {
      title: "Project description",
      key: projectSummary.project_summary_id,
      status: projectSummary.status_code,
      payload: projectSummary,
      statusHash: projectSummaryStatusCodesHash,
      required: true,
      navigateForward: () => navigateForward("DES"),
    },
    {
      title: "IRT",
      key: informationRequirementsTable.information_requirements_table_id,
      status: informationRequirementsTable.status_code,
      project_guid: projectGuid,
      payload: informationRequirementsTable,
      statusHash: informationRequirementsTableStatusCodesHash,
      required: project.mrc_review_required,
      navigateForward: () => navigateForward("IRT", informationRequirementsTable?.status_code),
    },
    {
      title: "Application",
      key: majorMinesApplication?.major_mine_application_id,
      status: majorMinesApplication?.status_code,
      project_guid: projectGuid,
      payload: majorMinesApplication,
      statusHash: majorMinesApplicationStatusCodesHash,
      required: true,
      navigateForward: () => navigateForward("MMA", majorMinesApplication?.status_code),
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
                {formatDate(expected_draft_irt_submission_date) || UNKNOWN}
              </Descriptions.Item>
              <Descriptions.Item
                span={12}
                label="Desired date to receive permit/amendment(s)"
                className="vertical-description"
              >
                {formatDate(expected_permit_receipt_date) || UNKNOWN}
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
                {formatDate(expected_permit_application_date) || UNKNOWN}
              </Descriptions.Item>
              <Descriptions.Item
                span={12}
                label="Anticipated work start"
                className="vertical-description"
              >
                {formatDate(expected_project_start_date) || UNKNOWN}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
        <Typography.Title level={4}>Project Stages</Typography.Title>
        <ProjectStagesTable projectStages={projectStages} />
      </Col>
      <Col lg={{ span: 9, offset: 1 }} xl={{ span: 7, offset: 1 }}>
        <Row gutter={[0, 16]}>
          <Col span={24}>{renderProjectContactsCard(project.contacts)}</Col>
          <Col span={24}>
            <Card title="Ministry Contacts">
              {EMLIcontactInfo.map((contact) => (
                <MinistryContactItem contact={contact} key={contact.contact_id} />
              ))}
            </Card>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default ProjectOverviewTab;
