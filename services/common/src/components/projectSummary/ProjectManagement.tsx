import React, { FC, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Field, getFormValues } from "redux-form";
import { SystemFlagEnum } from "@mds/common/constants/enums";
import { getSystemFlag } from "@mds/common/redux/selectors/authenticationSelectors";
import RenderSelect from "../forms/RenderSelect";
import { FORM } from "@mds/common/constants/forms";
import { getDropdownProjectSummaryStatusCodes } from "@mds/common/redux/selectors/staticContentSelectors";
import { Alert, Typography } from "antd";
import {
  CLEAR_PROJECT_SUMMARY_MINISTRY_COMMENTS,
  IGroupedDropdownList,
  IProjectSummaryMinistryComment,
} from "../..";
import { getDropdownProjectLeads } from "@mds/common/redux/selectors/partiesSelectors";
import MinistryCommentPanel from "@mds/core-web/src/components/common/comments/MinistryCommentPanel";
import * as Permission from "@mds/core-web/src/constants/permissions";
import {
  clearProjectSummaryMinistryComments,
  createProjectSummaryMinistryComment,
  fetchProjectSummaryMinistryComments,
} from "@mds/common/redux/actionCreators/projectActionCreator";
import { getProjectSummaryMinistryComments } from "@mds/common/redux/selectors/projectSelectors";

const { Paragraph, Title, Text } = Typography;

const unassignedProjectLeadEntry = {
  label: "Unassigned",
  value: null,
};

export const ProjectManagement: FC = () => {
  const dispatch = useDispatch();
  const systemFlag = useSelector(getSystemFlag);
  const isCore = systemFlag === SystemFlagEnum.core;

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
      <Typography.Title level={3}>Project Management</Typography.Title>
      <Paragraph>
        Need help with this feature? Here&apos;s the guide to help you learn more or get
        step-by-step instructions.
      </Paragraph>
      <Title level={3} className="color-primary">
        EMLI Status
      </Title>
      <Title level={4}>Project Status</Title>
      {status_code && (
        <Field
          id="status_code"
          name="status_code"
          required
          label="Project status is shared with the proponent via MineSpace. Changing the status will notify
        the project’s Primary Contact."
          component={RenderSelect}
          data={projectSummaryStatusCodes}
        />
      )}
      <Alert
        message="Submitted"
        description="This report has been submitted successfully"
        type="warning"
        showIcon
      />
      <Title level={3}>
        Assigned Project Lead <Text>(Optional)</Text>
      </Title>
      <Field
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
        <MinistryCommentPanel
          renderEditor={true}
          onSubmit={submitComment}
          loading={false}
          comments={ministryComments?.map((comment: IProjectSummaryMinistryComment) => ({
            key: comment.project_summary_ministry_comment_guid,
            author: comment.update_user,
            content: comment.content,
            actions: null,
            datetime: comment.update_timestamp,
          }))}
          createPermission={Permission.EDIT_PROJECT_SUMMARIES}
        />
      )}
    </>
  );
};
