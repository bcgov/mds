import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
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
import { fetchProjectById } from "@common/actionCreators/projectActionCreator";
import { Link } from "react-router-dom";
import CustomPropTypes from "@/customPropTypes";
import * as routes from "@/constants/routes";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import ProjectOverviewTab from "@/components/mine/Projects/ProjectOverviewTab";
import NullScreen from "@/components/common/NullScreen";
import { ArrowLeftOutlined, EnvironmentOutlined } from "@ant-design/icons";

const propTypes = {
  formattedProjectSummary: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)])
  ).isRequired,
  match: PropTypes.shape({
    params: {
      projectGuid: PropTypes.string,
    },
  }).isRequired,
  projectSummaryStatusCodeHash: PropTypes.objectOf(PropTypes.string).isRequired,
  projectSummaryPermitTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  projectSummaryAuthorizationTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  fetchProjectById: PropTypes.func.isRequired,
  projectSummaryStatusCodes: CustomPropTypes.options.isRequired,
};

export class Project extends Component {
  state = {
    isLoaded: false,
    activeTab: "overview",
  };

  componentDidMount() {
    this.handleFetchData(this.props.match.params);
  }

  handleFetchData = (params) => {
    const { projectGuid } = params;
    if (projectGuid) {
      return this.props
        .fetchProjectById(projectGuid)
        .then(() => this.setState({ isLoaded: true, isValid: true }))
        .catch(() => this.setState({ isLoaded: false, isValid: false }));
    }
    return null;
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
            {this.props.project.project_title}
            <span className="padding-sm--left">
              <Tag title={`Mine: ${this.props.project.mine_name}`}>
                <Link
                  style={{ textDecoration: "none" }}
                  to={routes.MINE_GENERAL.dynamicRoute(this.props.project.mine_guid)}
                  disabled={!this.props.project.mine_guid}
                >
                  <EnvironmentOutlined className="padding-sm--right" />
                  {this.props.project.mine_name}
                </Link>
              </Tag>
            </span>
          </h1>
          <Link to={routes.MINE_PRE_APPLICATIONS.dynamicRoute(this.props.project.mine_guid)}>
            <ArrowLeftOutlined className="padding-sm--right" />
            Back to: {this.props.project.mine_name} Major projects
          </Link>
        </div>
        <Tabs
          size="large"
          activeKey={this.state.activeTab}
          animated={{ inkBar: true, tabPane: false }}
          className="now-tabs"
          style={{ margin: "0" }}
          centered
        >
          <Tabs.TabPane tab="Overview" key="overview">
            <LoadingWrapper condition={this.state.isLoaded}>
              <div className="padding-lg">
                <ProjectOverviewTab />
              </div>
            </LoadingWrapper>
          </Tabs.TabPane>
        </Tabs>
      </div>
    );
  }
}

Project.propTypes = propTypes;

const mapStateToProps = (state) => {
  return {
    project: getProject(state),
    projectSummary: getProjectSummary(state),
    formattedProjectSummary: getFormattedProjectSummary(state),
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
      fetchProjectById,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Project);
