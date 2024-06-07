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
import { removeNullValuesRecursive } from "@mds/common/constants/utils";
import { getProjectSummaryAuthorizationTypesArray } from "@mds/common/redux/selectors/staticContentSelectors";
import { isArray } from "lodash";
import { MinistryContact } from "./MinistryContact";
import { getSystemFlag } from "@mds/common/redux/selectors/authenticationSelectors";
import { SystemFlagEnum } from "../..";

interface ProjectSummaryFormProps {
  initialValues: IProjectSummary;
  handleTabChange: (newTab: string) => void;
  handleSaveData: (formValues, newActiveTab?) => Promise<void>;
  handleSaveDraft: (formValues) => Promise<void>;
  activeTab: string;
  isEditMode?: boolean;
}

// converted to a function to make feature flag easier to work with
// when removing feature flag, convert back to array
export const getProjectFormTabs = (amsFeatureEnabled: boolean, isCore = false) => {
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
    projectFormTabs.splice(1, 0, "ministry-contact");
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
  handleSaveDraft,
  handleTabChange,
  activeTab,
  isEditMode = true,
}) => {
  const systemFlag = useSelector(getSystemFlag);
  const isCore = systemFlag === SystemFlagEnum.core;
  const { isFeatureEnabled } = useFeatureFlag();
  const majorProjectsFeatureEnabled = isFeatureEnabled(Feature.MAJOR_PROJECT_LINK_PROJECTS);
  const amsFeatureEnabled = isFeatureEnabled(Feature.AMS_AGENT);
  const projectFormTabs = getProjectFormTabs(amsFeatureEnabled, isCore);
  const projectSummaryAuthorizationTypesArray = useSelector(
    getProjectSummaryAuthorizationTypesArray
  );

  const transformAuthorizations = (valuesFromForm: any) => {
    const { authorizations = {}, project_summary_guid } = valuesFromForm;

    const transformAuthorization = (type, authorization) => {
      return { ...authorization, project_summary_authorization_type: type, project_summary_guid };
    };

    let updatedAuthorizations = [];
    let newAmsAuthorizations = [];
    let amendAmsAuthorizations = [];

    projectSummaryAuthorizationTypesArray.forEach((type) => {
      const authsOfType = authorizations[type];
      if (authsOfType) {
        if (isArray(authsOfType)) {
          const formattedAuthorizations = authsOfType.map((a) => {
            return transformAuthorization(type, a);
          });
          updatedAuthorizations = updatedAuthorizations.concat(formattedAuthorizations);
        } else {
          newAmsAuthorizations = newAmsAuthorizations.concat(
            authsOfType?.NEW.map((a) =>
              transformAuthorization(type, {
                ...a,
                project_summary_permit_type: ["NEW"],
              })
            )
          );
          amendAmsAuthorizations = amendAmsAuthorizations.concat(
            authsOfType?.AMENDMENT.map((a) =>
              transformAuthorization(type, {
                ...a,
                project_summary_permit_type: ["AMENDMENT"],
              })
            )
          );
        }
      }
    });
    return {
      authorizations: updatedAuthorizations,
      ams_authorizations: { amendments: amendAmsAuthorizations, new: newAmsAuthorizations },
    };
  };

  const handleTransformPayload = (valuesFromForm: any) => {
    let payloadValues: any = {};
    const updatedAuthorizations = transformAuthorizations(valuesFromForm);
    const values = removeNullValuesRecursive(valuesFromForm);
    payloadValues = {
      ...values,
      ...updatedAuthorizations,
    };
    delete payloadValues.authorizationTypes;
    return payloadValues;
  };

  const renderTabComponent = (tab) =>
    ({
      "ministry-contact": <MinistryContact />,
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
      formName={FORM.ADD_EDIT_PROJECT_SUMMARY}
      initialValues={initialValues}
      isEditMode={isEditMode}
      handleSaveData={handleSaveData}
      handleSaveDraft={handleSaveDraft}
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
