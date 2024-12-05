import React, { FC } from "react";
import { useSelector } from "react-redux";
import { getFormValues } from "redux-form";
import { FORM } from "@mds/common/constants/forms";
import DocumentUpload from "@mds/common/components/projectSummary/DocumentUpload";
import ProjectContacts from "@mds/common/components/projectSummary/ProjectContacts";
import ProjectDates from "@mds/common/components/projectSummary/ProjectDates";
import AuthorizationsInvolved from "@mds/common/components/projectSummary/AuthorizationsInvolved";
import SteppedForm from "@mds/common/components/forms/SteppedForm";
import Step from "@mds/common/components/forms/Step";
import ProjectLinks from "@mds/common/components/projectSummary/ProjectLinks";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { IProjectSummary, IProjectSummaryForm } from "@mds/common/interfaces/projects";
import { Feature } from "@mds/common/utils/featureFlag";
import { Agent } from "./Agent";
import { LegalLandOwnerInformation } from "@mds/common/components/projectSummary/LegalLandOwnerInformation";
import { FacilityOperator } from "@mds/common/components/projectSummary/FacilityOperator";
import BasicInformation from "@mds/common/components/projectSummary/BasicInformation";
import Applicant from "@mds/common/components/projectSummary/Applicant";
import Declaration from "@mds/common/components/projectSummary/Declaration";
import { ApplicationSummary } from "./ApplicationSummary";
import { getProjectSummaryAuthorizationTypesArray } from "@mds/common/redux/selectors/staticContentSelectors";
import { ProjectManagement } from "./ProjectManagement";
import { getSystemFlag } from "@mds/common/redux/selectors/authenticationSelectors";
import { SystemFlagEnum } from "../..";
import { formatProjectPayload } from "@mds/common/utils/helpers";
import { areAuthFieldsDisabled, areDocumentFieldsDisabled, areFieldsDisabled } from "../projects/projectUtils";

interface ProjectSummaryFormProps {
  initialValues: IProjectSummary;
  handleTabChange: (newTab: string) => void;
  handleSaveData: (formValues, newActiveTab?) => Promise<void>;
  activeTab: string;
  isEditMode?: boolean;
}

// converted to a function to make feature flag easier to work with
// when removing feature flag, convert back to array
export const getProjectFormTabs = (
  amsFeatureEnabled: boolean,
  isCore = false,
  projectRefactorEnabled: boolean
) => {
  const projectFormTabs = [
    "basic-information",
    "related-projects",
    "purpose-and-authorization",
    "project-contacts",
    "applicant-information",
    "representing-agent",
    "location-access-and-land-use",
    "mine-components-and-offsite-infrastructure",
    "project-dates",
    "document-upload",
    "application-summary",
    "declaration",
  ];
  if (isCore) {
    projectFormTabs.splice(
      1,
      0,
      projectRefactorEnabled ? "project-management" : "ministry-contact"
    );
  }

  return amsFeatureEnabled
    ? projectFormTabs
    : [
      "basic-information",
      "related-projects",
      "project-contacts",
      "project-dates",
      "document-upload",
    ];
};

export interface ProjectSummaryFormComponentProps {
  fieldsDisabled: boolean;
}

export const ProjectSummaryForm: FC<ProjectSummaryFormProps> = ({
  initialValues,
  handleSaveData,
  handleTabChange,
  activeTab,
  isEditMode = true,
}) => {
  const systemFlag = useSelector(getSystemFlag);
  const isCore = systemFlag === SystemFlagEnum.core;
  const { isFeatureEnabled } = useFeatureFlag();
  const majorProjectsFeatureEnabled = isFeatureEnabled(Feature.MAJOR_PROJECT_LINK_PROJECTS);
  const amsFeatureEnabled = isFeatureEnabled(Feature.AMS_AGENT);
  const projectFormTabs = getProjectFormTabs(
    amsFeatureEnabled,
    isCore,
    isFeatureEnabled(Feature.MAJOR_PROJECT_REFACTOR)
  );
  const projectSummaryAuthorizationTypesArray = useSelector(
    getProjectSummaryAuthorizationTypesArray
  );
  const formValues = useSelector(getFormValues(FORM.ADD_EDIT_PROJECT_SUMMARY)) as IProjectSummaryForm;
  const { status_code, confirmation_of_submission } = formValues ?? {};

  const fieldsDisabled = areFieldsDisabled(systemFlag, status_code, confirmation_of_submission);
  const docFieldsDisabled = areDocumentFieldsDisabled(systemFlag, status_code);
  const authFieldsDisabled = areAuthFieldsDisabled(systemFlag, status_code, confirmation_of_submission);

  const handleTransformPayload = (valuesFromForm: any) => {
    return formatProjectPayload(valuesFromForm, { projectSummaryAuthorizationTypesArray });
  };

  const renderTabComponent = (tab) =>
  ({
    "project-management": <ProjectManagement />,
    // TODO: FEATURE.MAJOR_PROJECT_REFACTOR - 'ministry-contact' can be removed once this flag is removed
    "ministry-contact": <ProjectManagement />,
    "location-access-and-land-use": <LegalLandOwnerInformation fieldsDisabled={fieldsDisabled} />,
    "basic-information": <BasicInformation fieldsDisabled={fieldsDisabled} />,
    "related-projects": (
      <ProjectLinks
        fieldsDisabled={fieldsDisabled}
        viewProject={(p) => GLOBAL_ROUTES?.EDIT_PROJECT.dynamicRoute(p.project_guid)}
      />
    ),
    "project-contacts": <ProjectContacts fieldsDisabled={fieldsDisabled} />,
    "project-dates": <ProjectDates fieldsDisabled={fieldsDisabled} />,
    "applicant-information": <Applicant fieldsDisabled={fieldsDisabled} />,
    "representing-agent": <Agent fieldsDisabled={fieldsDisabled} />,
    "mine-components-and-offsite-infrastructure": <FacilityOperator fieldsDisabled={fieldsDisabled} />,
    "purpose-and-authorization": <AuthorizationsInvolved fieldsDisabled={authFieldsDisabled} />,
    "document-upload": <DocumentUpload docFieldsDisabled={docFieldsDisabled} />,
    "application-summary": <ApplicationSummary fieldsDisabled={fieldsDisabled} />,
    declaration: <Declaration />,
  }[tab]);

  return (
    <SteppedForm
      name={FORM.ADD_EDIT_PROJECT_SUMMARY}
      initialValues={initialValues}
      isEditMode={isEditMode}
      handleSaveData={handleSaveData}
      handleTabChange={handleTabChange}
      transformPayload={handleTransformPayload}
      activeTab={activeTab}
    >
      {projectFormTabs
        .filter((tab) => majorProjectsFeatureEnabled || tab !== "related-projects")
        .map((tab) => (
          <Step key={tab}>{renderTabComponent(tab)}</Step>
        ))}
    </SteppedForm>
  );
};

export default ProjectSummaryForm;
