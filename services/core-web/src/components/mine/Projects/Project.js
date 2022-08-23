import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Tabs, Tag } from "antd";
import PropTypes from "prop-types";
import { getProject } from "@common/selectors/projectSelectors";
import { fetchProjectById } from "@common/actionCreators/projectActionCreator";
import { Link } from "react-router-dom";
import { ArrowLeftOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { detectProdEnvironment as IN_PROD } from "@common/utils/environmentUtils";
import CustomPropTypes from "@/customPropTypes";
import * as routes from "@/constants/routes";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import ProjectOverviewTab from "@/components/mine/Projects/ProjectOverviewTab";
import InformationRequirementsTableTab from "@/components/mine/Projects/InformationRequirementsTableTab";
import NullScreen from "@/components/common/NullScreen";
import ProjectDocumentsTab from "./ProjectDocumentsTab";

const propTypes = {
  project: CustomPropTypes.project.isRequired,
  match: PropTypes.shape({
    params: {
      projectGuid: PropTypes.string,
    },
  }).isRequired,
  history: PropTypes.shape({
    replace: PropTypes.func,
  }).isRequired,
  fetchProjectById: PropTypes.func.isRequired,
};

export class Project extends Component {
  state = {
    isLoaded: false,
    fixedTop: false,
    isValid: true,
    activeTab: "overview",
  };

  componentDidMount() {
    this.handleFetchData(this.props.match.params);
    window.addEventListener("scroll", this.handleScroll);
    this.handleScroll();
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  }

  handleScroll = () => {
    if (this.state.activeTab === "documents") {
      if (window.pageYOffset > 170 && !this.state.fixedTop) {
        this.setState({ fixedTop: true });
      } else if (window.pageYOffset <= 170 && this.state.fixedTop) {
        this.setState({ fixedTop: false });
      }
    }
  };

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

  handleTabChange = (activeTab) => {
    this.setState({ activeTab });
    const {
      project_guid,
      information_requirements_table: { irt_guid },
    } = this.props.project;
    let url = routes.PROJECTS.dynamicRoute(project_guid);
    switch (activeTab) {
      case "overview":
        url = routes.PROJECTS.dynamicRoute(project_guid);
        break;
      case "intro-project-overview":
        url = routes.INFORMATION_REQUIREMENTS_TABLE.dynamicRoute(project_guid, irt_guid);
        break;
      case "documents":
        url = routes.PROJECT_ALL_DOCUMENTS.dynamicRoute(project_guid);
        break;
      default:
        url = routes.PROJECTS.dynamicRoute(project_guid);
    }
    return this.props.history.replace(url);
  };

  render() {
    if (!this.state.isValid) {
      return <NullScreen type="generic" />;
    }

    const hasInformationRequirementsTable = Boolean(
      this.props.project.information_requirements_table?.irt_guid
    );

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
          onTabClick={this.handleTabChange}
        >
          <Tabs.TabPane tab="Overview" key="overview">
            <LoadingWrapper condition={this.state.isLoaded}>
              <div className="padding-lg">
                <ProjectOverviewTab />
              </div>
            </LoadingWrapper>
          </Tabs.TabPane>
          <Tabs.TabPane
            tab="IRT"
            key="intro-project-overview"
            disabled={!hasInformationRequirementsTable}
          >
            <LoadingWrapper condition={this.state.isLoaded}>
              <div className="padding-lg">
                <InformationRequirementsTableTab match={this.props.match} />
              </div>
            </LoadingWrapper>
          </Tabs.TabPane>
          {!IN_PROD() && (
            <Tabs.TabPane tab="All Documents" key="documents">
              <LoadingWrapper condition={this.state.isLoaded}>
                <div className="padding-lg">
                  <ProjectDocumentsTab />
                </div>
              </LoadingWrapper>
            </Tabs.TabPane>
          )}
        </Tabs>
      </div>
    );
  }
}

Project.propTypes = propTypes;

const mapStateToProps = (state) => {
  return {
    project: getProject(state),
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
