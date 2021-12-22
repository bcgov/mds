// TODO - Determine how to clear ProjectSummaryFileUpload state after successfully saving in edit mode
/* eslint-disable */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { compose, bindActionCreators } from "redux";
import { Field, reduxForm, change, arrayPush, formValueSelector } from "redux-form";
import { remove } from "lodash";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Typography } from "antd";
import { maxLength } from "@common/utils/Validate";
import { EDIT_PROJECT_SUMMARY } from "@/constants/routes";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";
import DocumentTable from "@/components/common/DocumentTable";
import ProjectSummaryFileUpload from "@/components/Forms/projectSummaries/ProjectSummaryFileUpload";
import BasicInformation from "@/components/Forms/projectSummaries/BasicInformation";
import DocumentUpload from "@/components/Forms/projectSummaries/DocumentUpload";

import ProjectContacts from "@/components/Forms/projectSummaries/ProjectContacts";
import ProjectDates from "@/components/Forms/projectSummaries/ProjectDates";
import AuthorizationsInvolved from "@/components/Forms/projectSummaries/AuthorizationsInvolved";

const propTypes = {
  initialValues: CustomPropTypes.projectSummary.isRequired,
  mineGuid: PropTypes.string.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  isEditMode: PropTypes.bool.isRequired,
  projectSummaryDocumentTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  change: PropTypes.func.isRequired,
  documents: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
  documents: [],
};

const tabs = [
  "basic-information",
  "project-contacts",
  "project-dates",
  "authorizations-involved",
  "document-upload",
];

export class ProjectSummaryForm extends Component {
  state = {
    // uploadedFiles: [],
    tabIndex: 0,
  };

  componentDidMount() {
    this.setState({ tabIndex: tabs.indexOf(this.props.match.params.tab) });
  }

  componentWillUpdate(nextProps) {
    const tabChanged = nextProps.match.params.tab !== this.props.match.params.tab;
    if (tabChanged) {
      this.setState({ tabIndex: tabs.indexOf(nextProps.match.params.tab) });
    }
  }

  // onFileLoad = (fileName, document_manager_guid) => {
  //   this.state.uploadedFiles.push({ document_name: fileName, document_manager_guid });
  //   this.props.change("documents", this.state.uploadedFiles);
  // };

  // onRemoveFile = (err, fileItem) => {
  //   remove(this.props.documents, { document_manager_guid: fileItem.serverId });
  //   return this.props.change(FORM.ADD_EDIT_PROJECT_SUMMARY, "documents", this.props.documents);
  // };

  render() {
    const renderTabComponent = (tab) =>
      ({
        "basic-information": <BasicInformation initialValues={this.props.initialValues} />,
        "project-contacts": <ProjectContacts initialValues={this.props.initialValues} />,
        "project-dates": <ProjectDates initialValues={this.props.initialValues} />,
        "authorizations-involved": (
          <AuthorizationsInvolved initialValues={this.props.initialValues} />
        ),
        "document-upload": (
          <DocumentUpload initialValues={this.props.initialValues} {...this.props} />
        ),
      }[tab]);
    const isFirst = this.state.tabIndex === 0;
    const isLast = tabs.length - 1 === this.state.tabIndex;
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        {renderTabComponent(tabs[this.state.tabIndex])}
        <div className="ant-modal-footer">
          {!isFirst && (
            <Button
              type="secondary"
              onClick={() => this.props.handleTabChange(tabs[this.state.tabIndex - 1])}
            >
              Back
            </Button>
          )}
          <Button type="ghost" loading={this.props.submitting}>
            Save Draft
          </Button>
          {!isLast && (
            <Button
              type="secondary"
              onClick={() => this.props.handleTabChange(tabs[this.state.tabIndex + 1])}
            >
              Next
            </Button>
          )}
          {isLast && (
            <Button type="primary" htmlType="submit" loading={this.props.submitting}>
              {this.props.isEditMode ? "Save" : "Submit"}
            </Button>
          )}
        </div>
      </Form>
    );
  }
}

ProjectSummaryForm.propTypes = propTypes;
ProjectSummaryForm.defaultProps = defaultProps;

const selector = formValueSelector(FORM.ADD_EDIT_PROJECT_SUMMARY);
const mapStateToProps = (state) => ({
  documents: selector(state, "documents"),
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
    enableReinitialize: true,
  })
)(withRouter(ProjectSummaryForm));
