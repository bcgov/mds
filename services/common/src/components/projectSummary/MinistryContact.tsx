import React, { FC } from "react";
import { useSelector } from "react-redux";
import { Field, getFormValues } from "redux-form";
import { SystemFlagEnum } from "@mds/common/constants/enums";
import { getSystemFlag } from "@mds/common/redux/selectors/authenticationSelectors";
import RenderSelect from "../forms/RenderSelect";
import { FORM } from "@mds/common/constants/forms";
import { getDropdownProjectSummaryStatusCodes } from "@mds/common/redux/selectors/staticContentSelectors";
import { Alert, Typography } from "antd";
import { IGroupedDropdownList } from "../..";
import { getDropdownProjectLeads } from "@mds/common/redux/selectors/partiesSelectors";

const unassignedProjectLeadEntry = {
  label: "Unassigned",
  value: null,
};

export const MinistryContact: FC = () => {
  const systemFlag = useSelector(getSystemFlag);
  const isCore = systemFlag === SystemFlagEnum.core;

  if (!isCore) {
    return null;
  }

  const { status_code, project_summary_guid, project_lead_party_guid } = useSelector((state) =>
    getFormValues(FORM.ADD_EDIT_PROJECT_SUMMARY)(state)
  );
  const isNewProject = !project_summary_guid;
  const isProjectLeadAssigned = Boolean(project_lead_party_guid);
  const projectSummaryStatusCodes = useSelector(getDropdownProjectSummaryStatusCodes);

  const projectLeads: IGroupedDropdownList = useSelector(getDropdownProjectLeads);
  const projectLeadData = [unassignedProjectLeadEntry, ...projectLeads[0]?.opt];

  return (
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
  );
};
