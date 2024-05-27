import React, { FC } from "react";
import { useSelector } from "react-redux";
import { flattenObject, resetForm } from "@common/utils/helpers";
import { formValueSelector, getFormSyncErrors, getFormValues } from "redux-form";
import * as FORM from "@/constants/forms";
import DocumentUpload from "@/components/Forms/projects/projectSummary/DocumentUpload";
import ProjectContacts from "@/components/Forms/projects/projectSummary/ProjectContacts";
import ProjectDates from "@/components/Forms/projects/projectSummary/ProjectDates";
import AuthorizationsInvolved from "@mds/common/components/projectSummary/AuthorizationsInvolved";
import SteppedForm from "@mds/common/components/forms/SteppedForm";
import Step from "@common/components/Step";
import ProjectLinks from "@mds/common/components/projects/ProjectLinks";
import { EDIT_PROJECT } from "@/constants/routes";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature, IProjectSummary } from "@mds/common";
import { Agent } from "./Agent";
import { LegalLandOwnerInformation } from "@mds/common/components/projectSummary/LegalLandOwnerInformation";
import { FacilityOperator } from "@mds/common/components/projectSummary/FacilityOperator";
import BasicInformation from "@mds/common/components/projectSummary/BasicInformation";
import Applicant from "@/components/Forms/projects/projectSummary/Applicant";
import Declaration from "@mds/common/components/projectSummary/Declaration";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { ApplicationSummary } from "./ApplicationSummary";

interface ProjectSummaryFormProps {
  initialValues: IProjectSummary;
  mineGuid: string;
  isEditMode: boolean;
  projectSummaryDocumentTypesHash: any;
  handleTabChange: (newTab: string) => void;
  handleSaveData: (event, activeTab) => void;
  handleSaveDraft: () => void;
  activeTab: string;
}

// converted to a function to make feature flag easier to work with
// when removing feature flag, convert back to array
export const getProjectFormTabs = (amsFeatureEnabled: boolean) => {
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

export const ProjectSummaryForm: FC<ProjectSummaryFormProps> = ({ ...props }) => {
  const selector = formValueSelector(FORM.ADD_EDIT_PROJECT_SUMMARY);

  const formValues =
    useSelector((state) => getFormValues(FORM.ADD_EDIT_PROJECT_SUMMARY)(state)) || {};
  const documents = useSelector((state) => selector(state, "documents")) || [];
  const formErrors = useSelector((state) =>
    getFormSyncErrors(FORM.ADD_EDIT_PROJECT_SUMMARY)(state)
  );
  const anyTouched = useSelector((state) => selector(state, "anyTouched"));

  const childProps = {
    ...props,
    formValues,
    formErrors,
    anyTouched,
  };

  const { isFeatureEnabled } = useFeatureFlag();
  const majorProjectsFeatureEnabled = isFeatureEnabled(Feature.MAJOR_PROJECT_LINK_PROJECTS);
  const amsFeatureEnabled = isFeatureEnabled(Feature.AMS_AGENT);
  const projectFormTabs = getProjectFormTabs(amsFeatureEnabled);

  const renderTabComponent = (tab) =>
    ({
      "location-access-and-land-use": <LegalLandOwnerInformation />,
      "basic-information": <BasicInformation />,
      "related-projects": (
        <ProjectLinks viewProject={(p) => EDIT_PROJECT.dynamicRoute(p.project_guid)} />
      ),
      "project-contacts": <ProjectContacts />,
      "project-dates": <ProjectDates initialValues={props.initialValues} />,
      "applicant-information": <Applicant />,
      "representing-agent": <Agent />,
      "mine-components-and-offsite-infrastructure": <FacilityOperator />,
      "purpose-and-authorization": (
        <AuthorizationsInvolved initialValues={props.initialValues} {...childProps} />
      ),
      "document-upload": (
        <DocumentUpload initialValues={props.initialValues} {...childProps} documents={documents} />
      ),
      "application-summary": <ApplicationSummary />,
      declaration: <Declaration />,
    }[tab]);

  const errors = Object.keys(flattenObject(formErrors));
  const disabledTabs = errors.length > 0;

  return (
    <FormWrapper
      name={FORM.ADD_EDIT_PROJECT_SUMMARY}
      onSubmit={() => {}}
      initialValues={props.initialValues}
      reduxFormConfig={{
        touchOnBlur: true,
        touchOnChange: false,
        onSubmitSuccess: resetForm(FORM.ADD_EDIT_PROJECT_SUMMARY),
      }}
    >
      <SteppedForm
        errors={errors}
        handleSaveData={props.handleSaveData}
        handleSaveDraft={props.handleSaveDraft}
        handleTabChange={props.handleTabChange}
        activeTab={props.activeTab}
      >
        {projectFormTabs
          .filter((tab) => majorProjectsFeatureEnabled || tab !== "related-projects")
          .map((tab) => (
            <Step key={tab} disabled={disabledTabs}>
              {renderTabComponent(tab)}
            </Step>
          ))}
      </SteppedForm>
    </FormWrapper>
  );
};

export default ProjectSummaryForm;
