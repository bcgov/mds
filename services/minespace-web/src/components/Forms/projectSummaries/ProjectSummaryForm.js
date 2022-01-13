// TODO - Determine how to clear ProjectSummaryFileUpload state after successfully saving in edit mode
/* eslint-disable */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { isEmpty } from "lodash";
import { withRouter } from "react-router-dom";
import { compose, bindActionCreators } from "redux";
import {
  Field,
  reduxForm,
  change,
  arrayPush,
  formValueSelector,
  getFormValues,
  getFormSyncErrors,
  // getFormState,
} from "redux-form";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Row, Col } from "antd";
import { maxLength } from "@common/utils/Validate";
import { EDIT_PROJECT_SUMMARY } from "@/constants/routes";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";
import DocumentTable from "@/components/common/DocumentTable";
import ProjectSummaryFileUpload from "@/components/Forms/projectSummaries/ProjectSummaryFileUpload";
import BasicInformation from "@/components/Forms/projectSummaries/BasicInformation";
import DocumentUpload from "@/components/Forms/projectSummaries/DocumentUpload";
import LinkButton from "@/components/common/LinkButton";

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
    const isFirst = this.state.tabIndex === 0;
    const isLast = tabs.length - 1 === this.state.tabIndex;
    console.log(this.props.formErrors);
    console.log(this.props.anyTouched);
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Row gutter={16}>
          <Col span={18}>
            <>{renderTabComponent(tabs[this.state.tabIndex])}</>
          </Col>
          <div className="vertical-tabs--tabpane--actions">
            <Row justify="space-between">
              <Col span={13}>
                <div>
                  {!isFirst && (
                    <Button
                      type="secondary"
                      disabled={!isEmpty(this.props.formErrors) && this.props.anyTouched}
                      onClick={() =>
                        this.props.handleTabChange(tabs[this.state.tabIndex - 1], false)
                      }
                    >
                      <LeftOutlined /> Back
                    </Button>
                  )}
                </div>
              </Col>
              <Col span={6}>
                <div>
                  {(this.props.initialValues.status_code === "D" || !this.props.isEditMode) && (
                    <LinkButton
                      onClick={(e) => this.props.handleSaveDraft(e, this.props.formValues)}
                      title="Save Draft"
                      disabled={this.props.submitting}
                    >
                      Save Draft
                    </LinkButton>
                  )}
                  {!isLast && (
                    <Button
                      type="secondary"
                      disabled={!isEmpty(this.props.formErrors) && this.props.anyTouched}
                      onClick={() =>
                        this.props.handleTabChange(tabs[this.state.tabIndex + 1], false)
                      }
                    >
                      Next <RightOutlined />
                    </Button>
                  )}
                  {isLast && (
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={this.props.submitting}
                      disabled={this.props.submitting}
                    >
                      {this.props.isEditMode && this.props.initialValues.status_code !== "D"
                        ? "Save"
                        : "Submit"}
                    </Button>
                  )}
                </div>
              </Col>
              <Col span={3} />
            </Row>
          </div>
        </Row>
      </Form>
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
  // formState: getFormState(FORM.ADD_EDIT_PROJECT_SUMMARY)(state),
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
  })
)(withRouter(ProjectSummaryForm));
