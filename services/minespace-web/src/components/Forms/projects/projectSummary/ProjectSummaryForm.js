import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { flattenObject, resetForm } from "@common/utils/helpers";
import { compose, bindActionCreators } from "redux";
import {
  reduxForm,
  change,
  arrayPush,
  formValueSelector,
  getFormValues,
  getFormSyncErrors,
} from "redux-form";
import "@ant-design/compatible/assets/index.css";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import BasicInformation from "@/components/Forms/projects/projectSummary/BasicInformation";
import DocumentUpload from "@/components/Forms/projects/projectSummary/DocumentUpload";
import ProjectContacts from "@/components/Forms/projects/projectSummary/ProjectContacts";
import ProjectDates from "@/components/Forms/projects/projectSummary/ProjectDates";
import AuthorizationsInvolved from "@/components/Forms/projects/projectSummary/AuthorizationsInvolved";
import SteppedForm from "@common/components/SteppedForm";
import Step from "@common/components/Step";

const propTypes = {
  initialValues: CustomPropTypes.projectSummary.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      tab: PropTypes.string,
    }),
  }).isRequired,
  mineGuid: PropTypes.string.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  isEditMode: PropTypes.bool.isRequired,
  projectSummaryDocumentTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  change: PropTypes.func.isRequired,
  documents: PropTypes.arrayOf(PropTypes.object),
  formErrors: PropTypes.objectOf(PropTypes.string),
  handleTabChange: PropTypes.func.isRequired,
  formValues: PropTypes.objectOf(PropTypes.string),
  handleSaveData: PropTypes.func.isRequired,
  handleSaveDraft: PropTypes.func.isRequired,
  activeTab: PropTypes.string.isRequired,
};

const defaultProps = {
  documents: [],
  formValues: {},
  formErrors: {},
};

const tabs = [
  "basic-information",
  "project-contacts",
  "project-dates",
  "authorizations-involved",
  "document-upload",
];

export class ProjectSummaryForm extends Component {
  render() {
    const renderTabComponent = (tab) =>
    ({
      "basic-information": <BasicInformation initialValues={this.props.initialValues} />,
      "project-contacts": <ProjectContacts initialValues={this.props.initialValues} />,
      "project-dates": <ProjectDates initialValues={this.props.initialValues} />,
      "authorizations-involved": (
        <AuthorizationsInvolved
          initialValues={this.props.initialValues}
          change={this.props.change}
        />
      ),
      "document-upload": (
        <DocumentUpload initialValues={this.props.initialValues} {...this.props} />
      ),
    }[tab]);

    const errors = Object.keys(flattenObject(this.props.formErrors));
    const disabledTabs = errors.length > 0;
    return (
      <SteppedForm
        errors={errors}
        handleSaveData={this.props.handleSaveData}
        handleSaveDraft={this.props.handleSaveDraft}
        handleTabChange={this.props.handleTabChange}
        activeTab={this.props.activeTab}
      >
        {tabs.map((tab) => (
          <Step key={tab} disabled={disabledTabs}>
            {renderTabComponent(tab)}
          </Step>
        ))}
      </SteppedForm>
    );
  }
}

ProjectSummaryForm.propTypes = propTypes;
ProjectSummaryForm.defaultProps = defaultProps;

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
    onSubmit: () => { },
  })
)(withRouter(ProjectSummaryForm));
