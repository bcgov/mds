import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { flattenObject, formatUrlToUpperCaseString } from "@common/utils/helpers";
import { Link, Prompt } from "react-router-dom";
import { submit, formValueSelector, getFormSyncErrors, reset, touch } from "redux-form";
import { Row, Col, Typography, Tabs, Divider } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { getMines } from "@common/selectors/mineSelectors";
import {
  getProjectSummary,
  getFormattedProjectSummary,
  getProject,
} from "@common/selectors/projectSelectors";
import {
  getProjectSummaryDocumentTypesHash,
  getProjectSummaryAuthorizationTypesArray,
} from "@common/selectors/staticContentSelectors";
import {
  createProjectSummary,
  updateProjectSummary,
  fetchProjectById,
  updateProject,
} from "@common/actionCreators/projectActionCreator";
import { fetchMineRecordById } from "@common/actionCreators/mineActionCreator";
import { clearProjectSummary } from "@common/actions/projectActions";
import * as FORM from "@/constants/forms";
import Loading from "@/components/common/Loading";
import {
  EDIT_PROJECT_SUMMARY,
  MINE_DASHBOARD,
  ADD_PROJECT_SUMMARY,
  EDIT_PROJECT,
} from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";
import ProjectSummaryForm from "@/components/Forms/projects/projectSummary/ProjectSummaryForm";

const propTypes = {
  mines: PropTypes.arrayOf(CustomPropTypes.mine).isRequired,
  projectSummary: CustomPropTypes.projectSummary.isRequired,
  project: CustomPropTypes.project.isRequired,
  fetchProjectById: PropTypes.func.isRequired,
  createProjectSummary: PropTypes.func.isRequired,
  updateProjectSummary: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  updateProject: PropTypes.func.isRequired,
  clearProjectSummary: PropTypes.func.isRequired,
  projectSummaryDocumentTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      mineGuid: PropTypes.string,
      projectGuid: PropTypes.string,
      projectSummaryGuid: PropTypes.string,
    }),
  }).isRequired,
  history: PropTypes.shape({ push: PropTypes.func, replace: PropTypes.func }).isRequired,
  submit: PropTypes.func.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  formValueSelector: PropTypes.func.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  getFormSyncErrors: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  touch: PropTypes.func.isRequired,
  formErrors: PropTypes.objectOf(PropTypes.string),
  projectSummaryAuthorizationTypesArray: PropTypes.arrayOf(PropTypes.any).isRequired,
  anyTouched: PropTypes.bool,
  formattedProjectSummary: PropTypes.objectOf(PropTypes.any).isRequired,
  location: PropTypes.shape({ pathname: PropTypes.string }).isRequired,
};

const defaultProps = {
  formErrors: {},
  anyTouched: false,
};

const tabs = [
  "basic-information",
  "project-contacts",
  "project-dates",
  "authorizations-involved",
  "document-upload",
];

export class ProjectSummaryPage extends Component {
  state = {
    isLoaded: false,
    isEditMode: false,
    activeTab: tabs[0],
  };

  componentDidMount() {
    this.handleFetchData();
  }

  componentWillUnmount() {
    this.props.clearProjectSummary();
  }

  handleFetchData = () => {
    const { mineGuid, projectGuid, projectSummaryGuid, tab } = this.props.match?.params;
    if (projectGuid && projectSummaryGuid) {
      return this.props
        .fetchProjectById(projectGuid)
        .then(() => this.setState({ isLoaded: true, isEditMode: true, activeTab: tab }));
    }
    return this.props.fetchMineRecordById(mineGuid).then(() => {
      this.setState({ isLoaded: true, activeTab: tab });
    });
  };

  // eslint-disable-next-line consistent-return
  handleSaveData = (e, values, message) => {
    e.preventDefault();
    this.props.submit(FORM.ADD_EDIT_PROJECT_SUMMARY);
    this.props.touch(FORM.ADD_EDIT_PROJECT_SUMMARY);
    const errors = Object.keys(flattenObject(this.props.formErrors));
    if (errors.length === 0) {
      if (!this.state.isEditMode) {
        return this.handleCreateProjectSummary(values, message);
      }
      return this.handleUpdateProjectSummary(values, message);
    }
  };

  handleTransformPayload = (values) => {
    let payloadValues = {};
    const updatedAuthorizations = [];
    // eslint-disable-next-line array-callback-return
    Object.keys(values).map((key) => {
      // Pull out form properties from request object that match known authorization types
      if (values[key] && this.props.projectSummaryAuthorizationTypesArray.includes(key)) {
        const project_summary_guid = values?.project_summary_guid;
        const authorization = values?.authorizations?.find(
          (auth) => auth?.project_summary_authorization_type === key
        );
        updatedAuthorizations.push({
          ...values[key],
          // Conditionally add project_summary_guid and project_summary_authorization_guid properties if this a pre-existing authorization
          // ... otherwise treat it as a new one which won't have those two properties yet.
          ...(project_summary_guid && { project_summary_guid }),
          ...(authorization && {
            project_summary_authorization_guid: authorization?.project_summary_authorization_guid,
          }),
          project_summary_authorization_type: key,
          project_summary_permit_type:
            key === "OTHER" ? ["OTHER"] : values[key]?.project_summary_permit_type,
          existing_permits_authorizations:
            values[key]?.existing_permits_authorizations?.split(",") || [],
        });
        // eslint-disable-next-line no-param-reassign
        delete values[key];
      }
    });
    payloadValues = {
      ...values,
      authorizations: updatedAuthorizations,
    };
    // eslint-disable-next-line no-param-reassign
    delete payloadValues.authorizationOptions;
    return payloadValues;
  };

  handleTabChange = (activeTab) => {
    const url = this.state.isEditMode
      ? EDIT_PROJECT_SUMMARY.dynamicRoute(
          this.props.match.params?.projectGuid,
          this.props.match.params?.projectSummaryGuid,
          activeTab
        )
      : ADD_PROJECT_SUMMARY.dynamicRoute(this.props.match.params?.mineGuid, activeTab);
    this.setState({ activeTab });
    this.props.history.push(url);
  };

  handleCreateProjectSummary(values, message) {
    return this.props
      .createProjectSummary(
        {
          mineGuid: this.props.match.params?.mineGuid,
        },
        this.handleTransformPayload(values),
        message
      )
      .then(({ data: { project_guid, project_summary_guid } }) => {
        this.props.history.replace(
          EDIT_PROJECT_SUMMARY.dynamicRoute(project_guid, project_summary_guid)
        );
      });
  }

  handleUpdateProjectSummary(values, message) {
    const { project_guid: projectGuid, project_summary_guid: projectSummaryGuid } = values;
    const payload = this.handleTransformPayload(values);
    return this.props
      .updateProjectSummary(
        {
          projectGuid,
          projectSummaryGuid,
        },
        payload,
        message
      )
      .then(() => {
        this.props.updateProject(
          { projectGuid },
          { mrc_review_required: payload.mrc_review_required, contacts: payload.contacts },
          "Successfully updated project.",
          false
        );
      })
      .then(() => {
        this.handleFetchData();
      });
  }

  render() {
    const errors = Object.keys(flattenObject(this.props.formErrors));
    const disabledTabs = errors.length > 0;
    const mineGuid = this.state.isEditMode
      ? this.props.formattedProjectSummary?.mine_guid
      : this.props.match.params.mineGuid;
    const mineName = this.state.isEditMode
      ? this.props.formattedProjectSummary?.mine_name || ""
      : this.props.mines[mineGuid]?.mine_name || "";
    const title = this.state.isEditMode
      ? `Edit project description - ${this.props.projectSummary?.project_summary_title}`
      : `New project description for ${mineName}`;
    return (
      (this.state.isLoaded && (
        <>
          <Prompt
            when={this.props.anyTouched}
            message={(location, action) => {
              if (action === "REPLACE") {
                this.props.reset(FORM.ADD_EDIT_PROJECT_SUMMARY);
              }
              return this.props.location.pathname !== location.pathname &&
                !location.pathname.includes("project-description") &&
                this.props.anyTouched
                ? "You have unsaved changes. Are you sure you want to leave without saving?"
                : true;
            }}
          />
          <Row>
            <Col span={24}>
              <Typography.Title>{title}</Typography.Title>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              {this.state.isEditMode ? (
                <Link to={EDIT_PROJECT.dynamicRoute(this.props.projectSummary.project_guid)}>
                  <ArrowLeftOutlined className="padding-sm--right" />
                  Back to: {this.props.project.project_title} Project Overview page
                </Link>
              ) : (
                <Link to={MINE_DASHBOARD.dynamicRoute(mineGuid, "applications")}>
                  <ArrowLeftOutlined className="padding-sm--right" />
                  Back to: {mineName} Applications page
                </Link>
              )}
            </Col>
          </Row>
          <Divider />
          <Tabs
            tabPosition="left"
            activeKey={this.state.activeTab}
            defaultActiveKey={tabs[0]}
            onChange={(tab) => this.handleTabChange(tab)}
            className="vertical-tabs"
          >
            {tabs.map((tab) => {
              return (
                <Tabs.TabPane
                  tab={formatUrlToUpperCaseString(tab)}
                  disabled={disabledTabs}
                  key={tab}
                  className="vertical-tabs--tabpane"
                >
                  <ProjectSummaryForm
                    initialValues={
                      this.state.isEditMode
                        ? {
                            ...this.props.formattedProjectSummary,
                            mrc_review_required: this.props.project.mrc_review_required,
                          }
                        : {}
                    }
                    mineGuid={mineGuid}
                    isEditMode={this.state.isEditMode}
                    handleSaveData={this.handleSaveData}
                    projectSummaryDocumentTypesHash={this.props.projectSummaryDocumentTypesHash}
                    handleTabChange={this.handleTabChange}
                  />
                </Tabs.TabPane>
              );
            })}
          </Tabs>
        </>
      )) || <Loading />
    );
  }
}

const selector = formValueSelector(FORM.ADD_EDIT_PROJECT_SUMMARY);
const mapStateToProps = (state) => ({
  anyTouched: state.form[FORM.ADD_EDIT_PROJECT_SUMMARY]?.anyTouched || false,
  fieldsTouched: state.form[FORM.ADD_EDIT_PROJECT_SUMMARY]?.fields || {},
  mines: getMines(state),
  projectSummary: getProjectSummary(state),
  formattedProjectSummary: getFormattedProjectSummary(state),
  project: getProject(state),
  projectSummaryDocumentTypesHash: getProjectSummaryDocumentTypesHash(state),
  projectSummaryAuthorizationTypesArray: getProjectSummaryAuthorizationTypesArray(state),
  formErrors: getFormSyncErrors(FORM.ADD_EDIT_PROJECT_SUMMARY)(state),
  contacts: selector(state, "contacts"),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createProjectSummary,
      updateProjectSummary,
      fetchMineRecordById,
      clearProjectSummary,
      fetchProjectById,
      updateProject,
      submit,
      reset,
      touch,
    },
    dispatch
  );

ProjectSummaryPage.propTypes = propTypes;
ProjectSummaryPage.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(ProjectSummaryPage);
