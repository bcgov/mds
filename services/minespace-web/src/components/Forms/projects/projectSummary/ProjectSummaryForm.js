import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { flattenObject, resetForm } from "@common/utils/helpers";
import { compose, bindActionCreators } from "redux";
import { isNil } from "lodash";
import {
  reduxForm,
  change,
  arrayPush,
  formValueSelector,
  getFormValues,
  getFormSyncErrors,
} from "redux-form";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Row, Col, Popconfirm } from "antd";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import BasicInformation from "@/components/Forms/projects/projectSummary/BasicInformation";
import DocumentUpload from "@/components/Forms/projects/projectSummary/DocumentUpload";
import LinkButton from "@/components/common/LinkButton";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import ProjectContacts from "@/components/Forms/projects/projectSummary/ProjectContacts";
import ProjectDates from "@/components/Forms/projects/projectSummary/ProjectDates";
import AuthorizationsInvolved from "@/components/Forms/projects/projectSummary/AuthorizationsInvolved";

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
  state = {
    tabIndex: 0,
  };

  componentDidMount() {
    this.setState({ tabIndex: tabs.indexOf(this.props.match.params.tab) });
  }

  componentWillUpdate(nextProps) {
    const tabChanged = nextProps.match.params.tab !== this.props.match.params.tab;
    if (tabChanged) {
      // eslint-disable-next-line react/no-will-update-set-state
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
    const errors = Object.keys(flattenObject(this.props.formErrors));
    const disabledButton = errors.length > 0;
    return (
      <Form layout="vertical">
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
                      onClick={() => this.props.handleTabChange(tabs[this.state.tabIndex - 1])}
                    >
                      <LeftOutlined /> Back
                    </Button>
                  )}
                </div>
              </Col>
              <Col span={6}>
                <div>
                  {(this.props.initialValues.status_code === "DFT" || !this.props.isEditMode) && (
                    <AuthorizationWrapper>
                      <LinkButton
                        onClick={(e) =>
                          this.props.handleSaveData(
                            e,
                            {
                              ...this.props.formValues,
                              status_code: "DFT",
                            },
                            "Successfully saved a draft project description."
                          )
                        }
                        title="Save Draft"
                        disabled={this.props.submitting}
                      >
                        Save Draft
                      </LinkButton>
                    </AuthorizationWrapper>
                  )}
                  {!isLast && (
                    <Button
                      type="secondary"
                      disabled={disabledButton}
                      onClick={() =>
                        this.props.handleTabChange(tabs[this.state.tabIndex + 1], false)
                      }
                    >
                      Next <RightOutlined />
                    </Button>
                  )}
                  {isLast && (
                    <>
                      {this.props.isEditMode && this.props.initialValues.status_code !== "DFT" ? (
                        <AuthorizationWrapper>
                          <Button
                            type="primary"
                            onClick={(e) =>
                              this.props.handleSaveData(
                                e,
                                {
                                  ...this.props.formValues,
                                },
                                "Successfully updated the project description."
                              )
                            }
                            loading={this.props.submitting}
                            disabled={this.props.submitting}
                          >
                            Update
                          </Button>
                        </AuthorizationWrapper>
                      ) : (
                        <>
                          <AuthorizationWrapper>
                            <Popconfirm
                              placement="topRight"
                              title="Are you sure you want to submit your project description to the Province of British Columbia?"
                              onConfirm={(e) =>
                                this.props.handleSaveData(
                                  e,
                                  {
                                    ...this.props.formValues,
                                    status_code: "SUB",
                                  },
                                  "Successfully submitted a project description to the Province of British Columbia."
                                )
                              }
                              okText="Yes"
                              cancelText="No"
                              disabled={
                                isNil(this.props.formValues?.contacts) ||
                                (!isNil(this.props.formValues?.contacts) &&
                                  this.props.formValues?.contacts.length === 0)
                              }
                            >
                              <Button
                                type="primary"
                                loading={this.props.submitting}
                                disabled={
                                  this.props.submitting ||
                                  isNil(this.props.formValues?.contacts) ||
                                  (!isNil(this.props.formValues?.contacts) &&
                                    this.props.formValues?.contacts.length === 0)
                                }
                              >
                                Submit
                              </Button>
                            </Popconfirm>
                          </AuthorizationWrapper>
                          {(isNil(this.props.formValues?.contacts) ||
                            (!isNil(this.props.formValues?.contacts) &&
                              this.props.formValues?.contacts.length === 0)) && (
                            <p className="red">Project Descriptions must have a contact.</p>
                          )}
                        </>
                      )}
                    </>
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
)(withRouter(ProjectSummaryForm));
