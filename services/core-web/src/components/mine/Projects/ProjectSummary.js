import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { submit, getFormValues, reset, touch } from "redux-form";
import { Tabs, Tag } from "antd";
import PropTypes from "prop-types";
import {
  getProjectSummaryStatusCodesHash,
  getProjectSummaryDocumentTypesHash,
  getTransformedChildProjectSummaryAuthorizationTypesHash,
  getProjectSummaryPermitTypesHash,
  getDropdownProjectSummaryStatusCodes,
} from "@common/selectors/staticContentSelectors";
import {
  getProjectSummary,
  getFormattedProjectSummary,
  getProject,
} from "@common/selectors/projectSelectors";
import {
  fetchProjectSummaryById,
  updateProjectSummary,
  removeDocumentFromProjectSummary,
} from "@common/actionCreators/projectActionCreator";
import { fetchMineRecordById } from "@common/actionCreators/mineActionCreator";
import { clearProjectSummary } from "@common/actions/projectActions";
import { Link } from "react-router-dom";
import { ArrowLeftOutlined, EnvironmentOutlined } from "@ant-design/icons";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import * as routes from "@/constants/routes";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import ProjectSummaryForm from "@/components/Forms/projectSummaries/ProjectSummaryForm";
import NullScreen from "@/components/common/NullScreen";
import ScrollSideMenu from "@/components/common/ScrollSideMenu";

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
  history: PropTypes.shape({ replace: PropTypes.func }).isRequired,
  projectSummaryStatusCodeHash: PropTypes.objectOf(PropTypes.string).isRequired,
  projectSummaryPermitTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  projectSummaryAuthorizationTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  fetchProjectSummaryById: PropTypes.func.isRequired,
  projectSummaryStatusCodes: CustomPropTypes.options.isRequired,
  updateProjectSummary: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  clearProjectSummary: PropTypes.func.isRequired,
  removeDocumentFromProjectSummary: PropTypes.func.isRequired,
};

export class ProjectSummary extends Component {
  state = {
    isLoaded: false,
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
        .fetchProjectSummaryById(projectGuid, projectSummaryGuid)
        .then(() => this.setState({ isLoaded: true, isValid: true, isEditMode: true }))
        .catch(() => this.setState({ isLoaded: false, isValid: false }));
    }
    return this.props.fetchMineRecordById(mineGuid).then(() => {
      this.setState({ isLoaded: true, activeTab: tab });
    });
  };

  handleSaveData = (e, message) => {
    e.preventDefault();
    this.props.submit(FORM.ADD_EDIT_PROJECT_SUMMARY);
    this.props.touch(FORM.ADD_EDIT_PROJECT_SUMMARY);
    const errors = Object.keys(flattenObject(this.props.formErrors));
    if (errors.length === 0) {
      if (!this.state.isEditMode) {
        return this.handleCreateProjectSummary(message);
      }
      return this.handleUpdate(message);
    }
  };

  handleCreate = (message) => {
    const mineGuid = this.props.match?.params?.mineGuid;
    this.props
      .createProjectSummary(
        {
          mineGuid: mineGuid,
        },
        this.handleTransformPayload(),
        message
      )
      .then(({ data: { project_guid, project_summary_guid } }) => {
        this.props.history.replace(
          routes.PRE_APPLICATIONS.dynamicRoute(project_guid, project_summary_guid)
        );
      });
  };

  handleUpdate = (message) => {
    const mineGuid = this.props.match?.params?.mineGuid;
    const projectSummaryGuid = this.props.match?.params?.projectSummaryGuid;
    const projectGuid = this.props.formValues.project_guid;
    this.props
      .updateProjectSummary({ projectGuid, projectSummaryGuid }, this.props.formValues, message)
      .then(() => {
        return this.props.fetchProjectSummaryById(mineGuid, projectSummaryGuid);
      })
      .then(() => {
        this.handleFetchData();
      });
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
        this.setState({ isLoaded: false });
        this.props.fetchProjectSummaryById(mineGuid, projectSummaryGuid);
      })
      .finally(() => this.setState({ isLoaded: true }));
  };

  render() {
    if (!this.state.isValid) {
      return <NullScreen type="generic" />;
    }
    return (
      <div className="page">
        <div
          className={
            this.state.fixedTop
              ? "padding-lg view--header fixed-scroll"
              : " padding-lg view--header"
          }
        >
          <h1>
            {this.props.formattedProjectSummary.project_summary_title}
            <span className="padding-sm--left">
              <Tag title={`Mine: ${this.props.formattedProjectSummary.mine_name}`}>
                <Link
                  style={{ textDecoration: "none" }}
                  to={routes.MINE_GENERAL.dynamicRoute(
                    this.props.formattedProjectSummary.mine_guid
                  )}
                  disabled={!this.props.formattedProjectSummary.mine_guid}
                >
                  <EnvironmentOutlined className="padding-sm--right" />
                  {this.props.formattedProjectSummary.mine_name}
                </Link>
              </Tag>
            </span>
          </h1>
          <Link to={routes.PROJECTS.dynamicRoute(this.props.formattedProjectSummary.project_guid)}>
            <ArrowLeftOutlined className="padding-sm--right" />
            Back to: {this.props.formattedProjectSummary.mine_name} Project overview
          </Link>
        </div>
        <div className={this.state.fixedTop ? "side-menu--fixed" : "side-menu top-100"}>
          <ScrollSideMenu
            menuOptions={[
              { href: "project-details", title: "Project details" },
              { href: "authorizations-involved", title: "Authorizations Involved" },
              { href: "project-dates", title: "Project dates" },
              { href: "project-contacts", title: "Project contacts" },
              { href: "documents", title: "Documents" },
            ]}
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
                  isEditMode={this.state.isEditMode}
                  initialValues={
                    this.state.isEditMode
                      ? {
                          ...this.props.formattedProjectSummary,
                          mrc_review_required: this.props.project.mrc_review_required,
                        }
                      : {}
                  }
                  handleSubmit={this.handleSaveData}
                  removeDocument={this.handleRemoveDocument}
                />
              </div>
            </LoadingWrapper>
          </Tabs.TabPane>
        </Tabs>
      </div>
    );
  }
}

ProjectSummary.propTypes = propTypes;

const mapStateToProps = (state) => {
  return {
    projectSummary: getProjectSummary(state),
    formattedProjectSummary: getFormattedProjectSummary(state),
    project: getProject(state),
    formValues: getFormValues(FORM.ADD_EDIT_PROJECT_SUMMARY)(state),
    projectSummaryStatusCodeHash: getProjectSummaryStatusCodesHash(state),
    projectSummaryDocumentTypesHash: getProjectSummaryDocumentTypesHash(state),
    projectSummaryAuthorizationTypesHash: getTransformedChildProjectSummaryAuthorizationTypesHash(
      state
    ),
    projectSummaryPermitTypesHash: getProjectSummaryPermitTypesHash(state),
    projectSummaryStatusCodes: getDropdownProjectSummaryStatusCodes(state),
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchProjectSummaryById,
      updateProjectSummary,
      removeDocumentFromProjectSummary,
      clearProjectSummary,
      fetchMineRecordById,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ProjectSummary);
