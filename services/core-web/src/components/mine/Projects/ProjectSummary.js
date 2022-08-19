import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getFormValues } from "redux-form";
import { Tabs, Tag } from "antd";
import PropTypes from "prop-types";
import {
  getProjectSummaryStatusCodesHash,
  getProjectSummaryDocumentTypesHash,
  getTransformedChildProjectSummaryAuthorizationTypesHash,
  getProjectSummaryPermitTypesHash,
  getDropdownProjectSummaryStatusCodes,
} from "@common/selectors/staticContentSelectors";
import { getProjectSummary, getFormattedProjectSummary } from "@common/selectors/projectSelectors";
import {
  fetchProjectSummaryById,
  updateProjectSummary,
  removeDocumentFromProjectSummary,
} from "@common/actionCreators/projectActionCreator";
import { Link } from "react-router-dom";
import { ArrowLeftOutlined, EnvironmentOutlined } from "@ant-design/icons";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import * as routes from "@/constants/routes";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import ProjectSummarySideMenu from "@/components/mine/Projects/ProjectSummarySideMenu";
import ProjectSummaryForm from "@/components/Forms/projectSummaries/ProjectSummaryForm";
import NullScreen from "@/components/common/NullScreen";

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
  removeDocumentFromProjectSummary: PropTypes.func.isRequired,
};

export class ProjectSummary extends Component {
  state = {
    isLoaded: false,
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
  }

  handleScroll = () => {
    if (window.pageYOffset > 170 && !this.state.fixedTop) {
      this.setState({ fixedTop: true });
    } else if (window.pageYOffset <= 170 && this.state.fixedTop) {
      this.setState({ fixedTop: false });
    }
  };

  handleFetchData = (params) => {
    const { projectGuid, projectSummaryGuid } = params;
    if (projectGuid && projectSummaryGuid) {
      return this.props
        .fetchProjectSummaryById(projectGuid, projectSummaryGuid)
        .then(() => this.setState({ isLoaded: true, isValid: true }))
        .catch(() => this.setState({ isLoaded: false, isValid: false }));
    }
    return null;
  };

  handleUpdate = (message) => {
    const mineGuid = this.props.match?.params?.mineGuid;
    const projectSummaryGuid = this.props.match?.params?.projectSummaryGuid;
    const projectGuid = this.props.formValues.project_guid;
    this.props
      .updateProjectSummary({ projectGuid, projectSummaryGuid }, this.props.formValues, message)
      .then(() => {
        return this.props.fetchProjectSummaryById(mineGuid, projectSummaryGuid);
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
          <ProjectSummarySideMenu />
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
                  initialValues={this.props.formattedProjectSummary}
                  handleSubmit={this.handleUpdate}
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
    formValues: getFormValues(FORM.PROJECT_SUMMARY)(state),
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
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ProjectSummary);
