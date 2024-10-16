import React, { FC } from "react";
import { useSelector } from "react-redux";
import { FORM } from "@mds/common/constants/forms";
import DocumentUpload from "@mds/common/components/projectSummary/DocumentUpload";
import ProjectContacts from "@mds/common/components/projectSummary/ProjectContacts";
import ProjectDates from "@mds/common/components/projectSummary/ProjectDates";
import AuthorizationsInvolved from "@mds/common/components/projectSummary/AuthorizationsInvolved";
import SteppedForm from "@mds/common/components/forms/SteppedForm";
import Step from "@mds/common/components/forms/Step";
import ProjectLinks from "@mds/common/components/projectSummary/ProjectLinks";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { IProjectSummary } from "@mds/common/interfaces/projects";
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

  const handleTransformPayload = (valuesFromForm: any) => {
    return formatProjectPayload(valuesFromForm, { projectSummaryAuthorizationTypesArray });
  };

  const renderTabComponent = (tab) =>
    ({
      "project-management": <ProjectManagement />,
      // TODO: FEATURE.MAJOR_PROJECT_REFACTOR - 'ministry-contact' can be removed once this flag is removed
      "ministry-contact": <ProjectManagement />,
      "location-access-and-land-use": <LegalLandOwnerInformation />,
      "basic-information": <BasicInformation />,
      "related-projects": (
        <ProjectLinks
          viewProject={(p) => GLOBAL_ROUTES?.EDIT_PROJECT.dynamicRoute(p.project_guid)}
        />
      ),
      "project-contacts": <ProjectContacts />,
      "project-dates": <ProjectDates />,
      "applicant-information": <Applicant />,
      "representing-agent": <Agent />,
      "mine-components-and-offsite-infrastructure": <FacilityOperator />,
      "purpose-and-authorization": <AuthorizationsInvolved />,
      "document-upload": <DocumentUpload />,
      "application-summary": <ApplicationSummary />,
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
