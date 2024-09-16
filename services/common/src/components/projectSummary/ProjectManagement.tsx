import React, { FC, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Field, getFormValues } from "redux-form";
import { SystemFlagEnum } from "@mds/common/constants/enums";
import { getSystemFlag } from "@mds/common/redux/selectors/authenticationSelectors";
import RenderSelect from "../forms/RenderSelect";
import { FORM } from "@mds/common/constants/forms";
import { getDropdownProjectSummaryStatusCodes } from "@mds/common/redux/selectors/staticContentSelectors";
import { Alert, Col, Row, Typography } from "antd";
import { Feature, IGroupedDropdownList, IProjectSummaryMinistryComment } from "../..";
import { getDropdownProjectLeads } from "@mds/common/redux/selectors/partiesSelectors";
import * as Permission from "@mds/core-web/src/constants/permissions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  clearProjectSummaryMinistryComments,
  createProjectSummaryMinistryComment,
  fetchProjectSummaryMinistryComments,
} from "@mds/common/redux/actionCreators/projectActionCreator";
import { getProjectSummaryMinistryComments } from "@mds/common/redux/selectors/projectSelectors";
import { faLock } from "@fortawesome/pro-regular-svg-icons";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import MinistryCommentPanel from "@mds/common/components/comments/MinistryCommentPanel";

const { Paragraph, Title } = Typography;

const unassignedProjectLeadEntry = {
  label: "Unassigned",
  value: null,
};

export const ProjectManagement: FC = () => {
  const dispatch = useDispatch();
  const systemFlag = useSelector(getSystemFlag);
  const isCore = systemFlag === SystemFlagEnum.core;

  const { isFeatureEnabled } = useFeatureFlag();

  const { status_code, project_summary_guid, project_lead_party_guid } = useSelector((state) =>
    getFormValues(FORM.ADD_EDIT_PROJECT_SUMMARY)(state)
  );

  const ministryComments = useSelector(getProjectSummaryMinistryComments);

  useEffect(() => {
    if (project_summary_guid) {
      dispatch(fetchProjectSummaryMinistryComments(project_summary_guid));
    }

    return () => {
      dispatch(clearProjectSummaryMinistryComments());
    };
  }, [project_summary_guid]);

  if (!isCore) {
    return null;
  }

  const isNewProject = !project_summary_guid;
  const isProjectLeadAssigned = Boolean(project_lead_party_guid);
  const projectSummaryStatusCodes = useSelector(getDropdownProjectSummaryStatusCodes);

  const projectLeads: IGroupedDropdownList = useSelector(getDropdownProjectLeads);
  const projectLeadData = [unassignedProjectLeadEntry, ...projectLeads[0]?.opt];

  const submitComment = async ({ comment }) => {
    await dispatch(createProjectSummaryMinistryComment(project_summary_guid, { content: comment }));
  };

  return (
    <>
      {isFeatureEnabled(Feature.MAJOR_PROJECT_REFACTOR) ? (
        <div>
          <Typography.Title level={3}>Project Management</Typography.Title>
          <Paragraph>
            Need help with this feature? Here&apos;s the <a>guide</a> to help you learn more or get
            step-by-step instructions.
          </Paragraph>
          <Title level={3} className="color-primary">
            EMLI Status
          </Title>
          <Title level={4}>Project Status</Title>
          <Paragraph>
            Project status is shared with the proponent via MineSpace. Changing the status will
            notify the project’s Primary Contact.
          </Paragraph>
          {status_code && (
            <Field
              id="status_code"
              name="status_code"
              required
              component={RenderSelect}
              data={projectSummaryStatusCodes}
            />
          )}
          <Alert
            message={projectSummaryStatusCodes.find((code) => code.value === status_code).label}
            type="warning"
            showIcon
            className="margin-large--bottom"
          />
          <Row gutter={8} justify="start" align="middle">
            <Col>
              <Title level={4}>Assigned Project Lead</Title>
            </Col>
            <Col>
              <Paragraph className="margin-medium--bottom">(Optional)</Paragraph>
            </Col>
          </Row>
          <Field
            showOptional={false}
            id="project_lead_party_guid"
            name="project_lead_party_guid"
            label="Select the Project Lead responsible for this project. This person will serve as the main
        contact for mine proponents and the Ministry of Environment."
            component={RenderSelect}
            data={projectLeadData}
          />
          {!isNewProject && !isProjectLeadAssigned && (
            <Alert
              message="This project does not have a Project Lead"
              description={<p>Please assign a Project Lead to this project.</p>}
              type="warning"
              showIcon
            />
          )}
          {isCore && (
            <div className="margin-large--top">
              <Row gutter={12.5} align="middle" className="margin-medium--bottom">
                <Col>
                  <FontAwesomeIcon size="lg" icon={faLock} className="color-primary" />
                </Col>
                <Col>
                  <Title level={3} className="color-primary margin-none">
                    Internal Ministry Comments
                  </Title>
                </Col>
              </Row>
              <Title level={4} className="margin-small--bottom">
                Internal Ministry Comment
              </Title>
              <Paragraph>
                Add comments to this project description for future reference. Anything written in
                these comments may be requested under FOIPPA. Keep it professional and concise.
              </Paragraph>
              <div className="project-summary-ministry-comments">
                <MinistryCommentPanel
                  renderEditor={true}
                  onSubmit={submitComment}
                  loading={false}
                  maxLength={500}
                  comments={ministryComments?.map((comment: IProjectSummaryMinistryComment) => ({
                    key: comment.project_summary_ministry_comment_guid,
                    author: comment.update_user,
                    content: comment.content,
                    actions: null,
                    datetime: comment.update_timestamp,
                  }))}
                  createPermission={Permission.EDIT_PROJECT_SUMMARIES}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <Typography.Title level={3}>Ministry Contact</Typography.Title>
          {status_code && (
            <Field
              id="status_code"
              name="status_code"
              label="Project Stage"
              component={RenderSelect}
              data={projectSummaryStatusCodes}
            />
          )}
          {!isNewProject && !isProjectLeadAssigned && (
            <Alert
              message="This project does not have a Project Lead"
              description={<p>Please assign a Project Lead to this project.</p>}
              type="warning"
              showIcon
            />
          )}
          <Field
            id="project_lead_party_guid"
            name="project_lead_party_guid"
            label="Project Lead"
            component={RenderSelect}
            data={projectLeadData}
          />
        </>
      )}
    </>
  );
};
