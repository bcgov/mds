import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withRouter, Link, Prompt } from "react-router-dom";
import { submit, getFormValues, getFormSyncErrors, reset, touch } from "redux-form";
import { flattenObject } from "@common/utils/helpers";
import { Tabs, Tag } from "antd";
import PropTypes from "prop-types";
import {
  getProjectSummaryStatusCodesHash,
  getProjectSummaryDocumentTypesHash,
  getTransformedChildProjectSummaryAuthorizationTypesHash,
  getProjectSummaryPermitTypesHash,
  getProjectSummaryAuthorizationTypesArray,
  getDropdownProjectSummaryStatusCodes,
} from "@common/selectors/staticContentSelectors";
import { getMineDocuments, getMines } from "@common/selectors/mineSelectors";
import {
  getProjectSummary,
  getFormattedProjectSummary,
  getProject,
} from "@common/selectors/projectSelectors";
import { fetchMineDocuments } from "@common/actionCreators/mineActionCreator";

import {
  createProjectSummary,
  fetchProjectSummaryById,
  fetchProjectById,
  updateProjectSummary,
  removeDocumentFromProjectSummary,
  updateProject,
} from "@common/actionCreators/projectActionCreator";
import { fetchMineRecordById } from "@common/actionCreators/mineActionCreator";
import { clearProjectSummary } from "@common/actions/projectActions";
import { ArrowLeftOutlined, EnvironmentOutlined } from "@ant-design/icons";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import * as routes from "@/constants/routes";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import Loading from "@/components/common/Loading";
import ProjectSummaryForm from "@/components/Forms/projectSummaries/ProjectSummaryForm";
import NullScreen from "@/components/common/NullScreen";
import ScrollSideMenu from "@/components/common/ScrollSideMenu";
import { Feature, isFeatureEnabled } from "@mds/common";

const propTypes = {
  formattedProjectSummary: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)])
  ).isRequired,
  match: PropTypes.shape({
    params: {
      projectSummaryGuid: PropTypes.string,
    },
  }).isRequired,
  formValues: PropTypes.objectOf(PropTypes.any).isRequired,
  project: CustomPropTypes.project.isRequired,
  mines: PropTypes.arrayOf(CustomPropTypes.mine).isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  projectSummaryStatusCodeHash: PropTypes.objectOf(PropTypes.string).isRequired,
  projectSummaryPermitTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  projectSummaryAuthorizationTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  fetchProjectSummaryById: PropTypes.func.isRequired,
  fetchProjectById: PropTypes.func.isRequired,
  projectSummaryStatusCodes: CustomPropTypes.options.isRequired,
  updateProjectSummary: PropTypes.func.isRequired,
  updateProject: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  clearProjectSummary: PropTypes.func.isRequired,
  createProjectSummary: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  touch: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
  anyTouched: PropTypes.bool,
  formErrors: PropTypes.objectOf(PropTypes.string),
  projectSummaryAuthorizationTypesArray: PropTypes.arrayOf(PropTypes.any).isRequired,
  removeDocumentFromProjectSummary: PropTypes.func.isRequired,
  location: PropTypes.shape({ pathname: PropTypes.string }).isRequired,
  mineDocuments: PropTypes.arrayOf(CustomPropTypes.mineDocument),
};

const defaultProps = {
  formErrors: {},
  anyTouched: false,
};

export class ProjectSummary extends Component {
  state = {
    isLoaded: false,
    isNewProject: false,
    isEditMode: false,
    fixedTop: false,
    isValid: true,
    activeTab: "project-descriptions",
  };

  componentDidMount() {
    this.handleFetchData(this.props.match.params);
    window.addEventListener("scroll", this.handleScroll);
    this.handleScroll();
  }

  componentDidUpdate(nextProps) {
    if (nextProps.match.params.projectSummaryGuid !== this.props.match.params.projectSummaryGuid) {
      this.handleFetchData(nextProps.match.params);
    }
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
    this.props.clearProjectSummary();
  }

  handleScroll = () => {
    if (window.pageYOffset > 170 && !this.state.fixedTop) {
      this.setState({ fixedTop: true });
    } else if (window.pageYOffset <= 170 && this.state.fixedTop) {
      this.setState({ fixedTop: false });
    }
  };

  handleFetchData = (params) => {
    const { projectGuid, projectSummaryGuid, mineGuid, tab } = params;

    if (projectGuid && projectSummaryGuid) {
      return this.props
        .fetchProjectById(projectGuid)
        .then((res) => {
          this.setState({ isLoaded: true, isValid: true, isNewProject: false });
          this.props.fetchMineDocuments(res.mine_guid, {
            project_summary_guid: projectSummaryGuid,
            is_archived: true,
          });
        })
        .catch((err) => {
          console.error(err);
          this.setState({ isLoaded: false, isValid: false });
        });
    }
    return this.props.fetchMineRecordById(mineGuid).then(() => {
      const mine = this.props.mines[mineGuid];
      this.setState({
        isLoaded: true,
        activeTab: tab,
        mineName: mine.mine_name,
        isNewProject: true,
        isEditMode: true,
      });
    });
  };

  toggleEditMode = () => {
    this.setState((prevState) => ({ isEditMode: !prevState.isEditMode }));
  };

  handleSaveData = (e, message) => {
    e.preventDefault();
    this.props.submit(FORM.ADD_EDIT_PROJECT_SUMMARY);
    this.props.touch(FORM.ADD_EDIT_PROJECT_SUMMARY);
    const errors = Object.keys(flattenObject(this.props.formErrors));
    if (errors.length === 0) {
      if (this.state.isNewProject) {
        return this.handleCreate(message);
      }
      return this.handleUpdate(message);
    }
    return null;
  };

  handleTransformPayload = (values) => {
    let payloadValues = {};
    const updatedAuthorizations = [];
    // eslint-disable-next-line array-callback-return
    Object.keys(values).map((key) => {
      // Pull out form properties from request object that match known authorization types
      if (values[key] && this.props.projectSummaryAuthorizationTypesArray?.includes(key)) {
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

  handleCreate = (message) => {
    const mineGuid = this.props.match?.params?.mineGuid;
    this.props
      .createProjectSummary(
        {
          mineGuid,
        },
        this.handleTransformPayload({ status_code: "SUB", ...this.props.formValues }),
        message
      )
      .then(({ data: { project_guid, project_summary_guid } }) => {
        this.props.history.push(
          routes.PRE_APPLICATIONS.dynamicRoute(project_guid, project_summary_guid)
        );
      })
      .then(() => this.handleFetchData(this.props.match.params));
  };

  handleUpdate = (message) => {
    const projectSummaryGuid = this.props.match?.params?.projectSummaryGuid;
    const {
      project_guid: projectGuid,
      mrc_review_required,
      contacts,
      project_lead_party_guid,
    } = this.props.formValues;
    return this.props
      .updateProjectSummary(
        { projectGuid, projectSummaryGuid },
        this.handleTransformPayload({ ...this.props.formValues }),
        message
      )
      .then(() =>
        this.props.updateProject(
          { projectGuid },
          { mrc_review_required, contacts, project_lead_party_guid },
          "Successfully updated project.",
          false
        )
      )
      .then(() => {
        this.handleFetchData(this.props.match.params);
        this.setState((prevState) => ({
          isEditMode: !prevState.isEditMode,
        }));
      });
  };

  reloadData = async (mineGuid, projectSummaryGuid) => {
    this.setState({ isLoaded: false });
    try {
      await this.props.fetchProjectSummaryById(mineGuid, projectSummaryGuid);
    } finally {
      this.setState({ isLoaded: true });
    }
  };

  handleRemoveDocument = (event, documentGuid) => {
    event.preventDefault();
    const {
      project_summary_guid: projectSummaryGuid,
      project_guid: projectGuid,
      mine_guid: mineGuid,
    } = this.props.formattedProjectSummary;
    return this.props
      .removeDocumentFromProjectSummary(projectGuid, projectSummaryGuid, documentGuid)
      .then(() => {
        this.reloadData(mineGuid, projectSummaryGuid);
      })
      .finally(() => this.setState({ isLoaded: true }));
  };

  render() {
    if (!this.state.isValid) {
      return <NullScreen type="generic" />;
    }

    const mineGuid = this.props.formattedProjectSummary?.mine_guid;
    const projectSummaryGuid = this.props.formattedProjectSummary?.project_summary_guid;

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
          <div className="page">
            <div
              className={
                this.state.fixedTop
                  ? "padding-lg view--header fixed-scroll"
                  : " padding-lg view--header"
              }
            >
              <h1>
                {this.props.formattedProjectSummary.project_summary_title
                  ? this.props.formattedProjectSummary.project_summary_title
                  : "New Project Description"}
                <span className="padding-sm--left">
                  <Tag
                    title={`Mine: ${
                      this.props.formattedProjectSummary.mine_name
                        ? this.props.formattedProjectSummary.mine_name
                        : this.props.match?.params?.mineGuid
                    }`}
                  >
                    <Link
                      style={{ textDecoration: "none" }}
                      to={routes.MINE_GENERAL.dynamicRoute(
                        this.props.formattedProjectSummary.mine_guid
                          ? this.props.formattedProjectSummary.mine_guid
                          : this.props.match?.params?.mineGuid
                      )}
                    >
                      <EnvironmentOutlined className="padding-sm--right" />
                      {this.props.formattedProjectSummary.mine_name
                        ? this.props.formattedProjectSummary.mine_name
                        : this.state.mineName}
                    </Link>
                  </Tag>
                </span>
              </h1>
              <Link
                to={
                  this.props.formattedProjectSummary.project_guid
                    ? routes.PROJECTS.dynamicRoute(this.props.formattedProjectSummary.project_guid)
                    : routes.MINE_PRE_APPLICATIONS.dynamicRoute(this.props.match?.params?.mineGuid)
                }
              >
                <ArrowLeftOutlined className="padding-sm--right" />
                Back to:{" "}
                {this.props.formattedProjectSummary.mine_name
                  ? this.props.formattedProjectSummary.mine_name
                  : this.state.mineName}{" "}
                Project overview
              </Link>
            </div>
            <div className={this.state.fixedTop ? "side-menu--fixed" : "side-menu top-100"}>
              <ScrollSideMenu
                menuOptions={[
                  { href: "project-details", title: "Project details" },
                  { href: "authorizations-involved", title: "Authorizations Involved" },
                  { href: "project-dates", title: "Project dates" },
                  { href: "project-contacts", title: "Project contacts" },
                  { href: "document-details", title: "Documents" },
                  isFeatureEnabled(Feature.MAJOR_PROJECT_ARCHIVE_FILE) && {
                    href: "archived-documents",
                    title: "Archived Documents",
                  },
                ].filter(Boolean)}
                featureUrlRoute={routes.PRE_APPLICATIONS.hashRoute}
                featureUrlRouteArguments={[
                  this.props.match?.params?.mineGuid,
                  this.props.match?.params?.projectSummaryGuid,
                ]}
              />
            </div>
            <Tabs
              size="large"
              activeKey={this.state.activeTab}
              animated={{ inkBar: true, tabPane: false }}
              className="now-tabs"
              style={{ margin: "0" }}
              centered
            >
              <Tabs.TabPane tab="Project Descriptions" key="project-descriptions">
                <LoadingWrapper condition={this.state.isLoaded}>
                  <div
                    className={
                      this.state.fixedTop
                        ? "side-menu--content with-fixed-top top-125"
                        : "side-menu--content"
                    }
                  >
                    <ProjectSummaryForm
                      {...this.props}
                      projectSummaryStatusCodes={this.props.projectSummaryStatusCodes}
                      isNewProject={this.state.isNewProject}
                      isEditMode={this.state.isEditMode}
                      toggleEditMode={this.toggleEditMode}
                      initialValues={
                        !this.state.isNewProject
                          ? {
                              ...this.props.formattedProjectSummary,
                              mrc_review_required: this.props.project.mrc_review_required,
                            }
                          : {
                              contacts: [
                                {
                                  is_primary: true,
                                  name: null,
                                  job_title: null,
                                  company_name: null,
                                  email: null,
                                  phone_number: null,
                                  phone_extension: null,
                                },
                              ],
                              documents: [],
                            }
                      }
                      reset={this.props.reset}
                      handleSaveData={this.handleSaveData}
                      handleUpdateData={this.handleUpdateData}
                      removeDocument={this.handleRemoveDocument}
                      onArchivedDocuments={this.reloadData.bind(this, mineGuid, projectSummaryGuid)}
                      archivedDocuments={this.props.mineDocuments}
                    />
                  </div>
                </LoadingWrapper>
              </Tabs.TabPane>
            </Tabs>
          </div>
        </>
      )) || <Loading />
    );
  }
}

ProjectSummary.propTypes = propTypes;
ProjectSummary.defaultProps = defaultProps;

const mapStateToProps = (state) => {
  return {
    projectSummary: getProjectSummary(state),
    formattedProjectSummary: getFormattedProjectSummary(state),
    project: getProject(state),
    mines: getMines(state),
    formValues: getFormValues(FORM.ADD_EDIT_PROJECT_SUMMARY)(state),
    formErrors: getFormSyncErrors(FORM.ADD_EDIT_PROJECT_SUMMARY)(state),
    anyTouched: state.form[FORM.ADD_EDIT_PROJECT_SUMMARY]?.anyTouched || false,
    fieldsTouched: state.form[FORM.ADD_EDIT_PROJECT_SUMMARY]?.fields || {},
    mineDocuments: getMineDocuments(state),
    projectSummaryStatusCodeHash: getProjectSummaryStatusCodesHash(state),
    projectSummaryDocumentTypesHash: getProjectSummaryDocumentTypesHash(state),
    projectSummaryAuthorizationTypesArray: getProjectSummaryAuthorizationTypesArray(state),
    projectSummaryAuthorizationTypesHash: getTransformedChildProjectSummaryAuthorizationTypesHash(
      state
    ),
    projectSummaryPermitTypesHash: getProjectSummaryPermitTypesHash(state),
    projectSummaryStatusCodes: getDropdownProjectSummaryStatusCodes(state),
    onSubmit: () => {},
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createProjectSummary,
      fetchProjectSummaryById,
      fetchProjectById,
      updateProjectSummary,
      removeDocumentFromProjectSummary,
      clearProjectSummary,
      fetchMineRecordById,
      fetchMineDocuments,
      updateProject,
      submit,
      touch,
      reset,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ProjectSummary));
