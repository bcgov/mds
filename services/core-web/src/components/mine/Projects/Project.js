import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Tabs, Tag } from "antd";
import PropTypes from "prop-types";
import { getProject } from "@mds/common/redux/selectors/projectSelectors";
import { fetchProjectById } from "@mds/common/redux/actionCreators/projectActionCreator";
import { Link } from "react-router-dom";
import { ArrowLeftOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { Feature } from "@mds/common";
import CustomPropTypes from "@/customPropTypes";
import * as routes from "@/constants/routes";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import ProjectOverviewTab from "@/components/mine/Projects/ProjectOverviewTab";
import InformationRequirementsTableTab from "@/components/mine/Projects/InformationRequirementsTableTab";
import MajorMineApplicationTab from "@/components/mine/Projects/MajorMineApplicationTab";
import NullScreen from "@/components/common/NullScreen";
import DecisionPackageTab from "@/components/mine/Projects/DecisionPackageTab";
import ProjectDocumentsTab from "./ProjectDocumentsTab";
import withFeatureFlag from "@mds/common/providers/featureFlags/withFeatureFlag";
import ProjectDescriptionTab from "@mds/common/components/project/ProjectDescriptionTab";

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
  isFeatureEnabled: PropTypes.func.isRequired,
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

  // Handle clicking an activity notification link(MMA tab) while Project component is mounted
  componentDidUpdate(prevProps) {
    const currentTab = this.props.match.params.tab;
    const tabChanged = prevProps.match.params.tab !== currentTab;
    if (tabChanged && currentTab !== this.state.activeTab) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ activeTab: currentTab });
    }
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  }

  handleScroll = () => {
    if (["documents", "decision-package", "final-app"].includes(this.state.activeTab)) {
      if (window.pageYOffset > 170 && !this.state.fixedTop) {
        this.setState({ fixedTop: true });
      } else if (window.pageYOffset <= 170 && this.state.fixedTop) {
        this.setState({ fixedTop: false });
      }
    }
  };

  handleFetchData = (params) => {
    const { projectGuid } = params;
    const activeTab = params?.tab ? { activeTab: params?.tab } : { activeTab: "overview" };
    if (projectGuid) {
      return this.props
        .fetchProjectById(projectGuid)
        .then(() => this.setState({ isLoaded: true, isValid: true, ...activeTab }))
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
    let url = routes.EDIT_PROJECT.dynamicRoute(project_guid);
    switch (activeTab) {
      case "overview":
        url = routes.EDIT_PROJECT.dynamicRoute(project_guid);
        break;
      case "project-description":
        url = routes.EDIT_PROJECT.dynamicRoute(project_guid, activeTab);
        break;
      case "intro-project-overview":
        url = routes.INFORMATION_REQUIREMENTS_TABLE.dynamicRoute(project_guid, irt_guid);
        break;
      case "documents":
        url = routes.PROJECT_ALL_DOCUMENTS.dynamicRoute(project_guid);
        break;
      case "final-app":
        url = routes.PROJECT_FINAL_APPLICATION.dynamicRoute(project_guid);
        break;
      case "decision-package":
        url = routes.PROJECT_DECISION_PACKAGE.dynamicRoute(project_guid);
        break;
      default:
        url = routes.EDIT_PROJECT.dynamicRoute(project_guid);
    }
    return this.props.history.replace(url);
  };

  render() {
    if (!this.state.isValid) {
      return <NullScreen type="generic" />;
    }

    const { information_requirements_table, major_mine_application } = this.props.project;
    const hasInformationRequirementsTable = Boolean(information_requirements_table?.irt_guid);
    const hasFinalAplication = Boolean(major_mine_application?.major_mine_application_guid);

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
          <Link
            data-cy="back-to-major-project-link"
            to={routes.MINE_PRE_APPLICATIONS.dynamicRoute(this.props.project.mine_guid)}
          >
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
          {this.props.isFeatureEnabled(Feature.AMS_AGENT) && (
            <Tabs.TabPane tab="Project Description" key="project-description">
              <div className="padding-lg">
                <ProjectDescriptionTab />
              </div>
            </Tabs.TabPane>
          )}
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
          <Tabs.TabPane tab="Final Application" key="final-app" disabled={!hasFinalAplication}>
            <LoadingWrapper condition={this.state.isLoaded}>
              <div className="padding-lg">
                <MajorMineApplicationTab />
              </div>
            </LoadingWrapper>
          </Tabs.TabPane>
          {this.props.isFeatureEnabled(Feature.MAJOR_PROJECT_DECISION_PACKAGE) && (
            <Tabs.TabPane tab="Decision Package" key="decision-package">
              <LoadingWrapper condition={this.state.isLoaded}>
                <div className="padding-lg">
                  <DecisionPackageTab initialValues={{}} />
                </div>
              </LoadingWrapper>
            </Tabs.TabPane>
          )}

          {this.props.isFeatureEnabled(Feature.MAJOR_PROJECT_ALL_DOCUMENTS) && (
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

export default connect(mapStateToProps, mapDispatchToProps)(withFeatureFlag(Project));
