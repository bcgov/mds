import React, { FC } from "react";
import { connect } from "react-redux";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { flattenObject, resetForm } from "@common/utils/helpers";
import { compose, bindActionCreators } from "redux";
import {
  reduxForm,
  change,
  arrayPush,
  formValueSelector,
  getFormValues,
  getFormSyncErrors,
  InjectedFormProps,
} from "redux-form";
import * as FORM from "@/constants/forms";
import DocumentUpload from "@/components/Forms/projects/projectSummary/DocumentUpload";
import ProjectContacts from "@/components/Forms/projects/projectSummary/ProjectContacts";
import ProjectDates from "@/components/Forms/projects/projectSummary/ProjectDates";
import AuthorizationsInvolved from "@/components/Forms/projects/projectSummary/AuthorizationsInvolved";
import SteppedForm from "@mds/common/components/forms/SteppedForm";
import Step from "@common/components/Step";
import ProjectLinks from "@mds/common/components/projects/ProjectLinks";
import { EDIT_PROJECT } from "@/constants/routes";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature, IProjectSummary, IProjectSummaryDocument } from "@mds/common";
import { Agent } from "./Agent";
import { LegalLandOwnerInformation } from "@mds/common/components/projectSummary/LegalLandOwnerInformation";
import { FacilityOperator } from "@mds/common/components/projectSummary/FacilityOperator";
import BasicInformation from "@mds/common/components/projectSummary/BasicInformation";
import Applicant from "@/components/Forms/projects/projectSummary/Applicant";

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

interface StateProps {
  documents: IProjectSummaryDocument;
  formValues: any;
  formErrors: any;
  anyTouched: boolean;
}

// converted to a function to make feature flag easier to work with
// when removing feature flag, convert back to array
export const getProjectFormTabs = (amsFeatureEnabled: boolean) => {
  const projectFormTabs = [
    "basic-information",
    "related-projects",
    "project-contacts",
    "applicant-information",
    "agent",
    "facility-operator-information",
    "legal-land-owner-information",
    "project-dates",
    "authorizations-involved",
    "document-upload",
  ];

  return amsFeatureEnabled
    ? projectFormTabs
    : [
        "basic-information",
        "related-projects",
        "project-contacts",
        "project-dates",
        "authorizations-involved",
        "document-upload",
      ];
};

export const ProjectSummaryForm: FC<ProjectSummaryFormProps &
  StateProps &
  InjectedFormProps<IProjectSummary> &
  RouteComponentProps<any>> = ({ documents = [], ...props }) => {
  const { isFeatureEnabled } = useFeatureFlag();
  const majorProjectsFeatureEnabled = isFeatureEnabled(Feature.MAJOR_PROJECT_LINK_PROJECTS);
  const amsFeatureEnabled = isFeatureEnabled(Feature.AMS_AGENT);
  const projectFormTabs = getProjectFormTabs(amsFeatureEnabled);

  const renderTabComponent = (tab) =>
    ({
      "legal-land-owner-information": <LegalLandOwnerInformation />,
      "basic-information": <BasicInformation />,
      "related-projects": (
        <ProjectLinks viewProject={(p) => EDIT_PROJECT.dynamicRoute(p.project_guid)} />
      ),
      "project-contacts": <ProjectContacts />,
      "project-dates": <ProjectDates initialValues={props.initialValues} />,
      "applicant-information": <Applicant />,
      agent: <Agent />,
      "facility-operator-information": <FacilityOperator />,
      "authorizations-involved": (
        <AuthorizationsInvolved initialValues={props.initialValues} change={props.change} />
      ),
      "document-upload": (
        <DocumentUpload initialValues={props.initialValues} {...props} documents={documents} />
      ),
    }[tab]);

  const errors = Object.keys(flattenObject(props.formErrors));
  const disabledTabs = errors.length > 0;

  return (
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
  );
};

const selector = formValueSelector(FORM.ADD_EDIT_PROJECT_SUMMARY);
const mapStateToProps = (state) => ({
  documents: selector(state, "documents"),
  formValues: getFormValues(FORM.ADD_EDIT_PROJECT_SUMMARY)(state) || {},
  formErrors: getFormSyncErrors(FORM.ADD_EDIT_PROJECT_SUMMARY)(state),
  anyTouched: selector(state, "anyTouched"),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      change,
      arrayPush,
    },
    dispatch
  );

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: FORM.ADD_EDIT_PROJECT_SUMMARY,
    touchOnBlur: true,
    touchOnChange: false,
    onSubmitSuccess: resetForm(FORM.ADD_EDIT_PROJECT_SUMMARY),
    onSubmit: () => {},
  })
)(withRouter(ProjectSummaryForm)) as FC<ProjectSummaryFormProps>;
