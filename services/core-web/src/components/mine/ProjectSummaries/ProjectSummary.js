import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getFormValues } from "redux-form";
import { Tabs, Tag } from "antd";
import PropTypes from "prop-types";
import {
  getProjectSummaryStatusCodesHash,
  getProjectSummaryDocumentTypesHash,
  getTransformedProjectSummaryAuthorizationTypes,
  getProjectSummaryPermitTypesHash,
} from "@common/selectors/staticContentSelectors";
import {
  getProjectSummary,
  getFormattedProjectSummary,
} from "@common/selectors/projectSummarySelectors";
import { fetchProjectSummaryById } from "@common/actionCreators/projectSummaryActionCreator";
import * as FORM from "@/constants/forms";
import { Link } from "react-router-dom";
import * as routes from "@/constants/routes";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import ProjectSummarySideMenu from "@/components/mine/ProjectSummaries/ProjectSummarySideMenu";
import ProjectSummaryForm from "@/components/Forms/projectSummaries/ProjectSummaryForm";
import NullScreen from "@/components/common/NullScreen";
import { ArrowLeftOutlined, EnvironmentOutlined } from "@ant-design/icons";

const propTypes = {
  formattedProjectSummary: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)])
  ).isRequired,
  match: PropTypes.shape({
    params: {
      projectSummaryGuid: PropTypes.string,
    },
  }).isRequired,
  history: PropTypes.shape({ replace: PropTypes.func }).isRequired,
  projectSummaryStatusCodeHash: PropTypes.objectOf(PropTypes.string).isRequired,
  projectSummaryPermitTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  projectSummaryAuthorizationTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  fetchProjectSummaryById: PropTypes.func.isRequired,
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
    const { mineGuid, projectSummaryGuid } = params;
    if (mineGuid && projectSummaryGuid) {
      return this.props
        .fetchProjectSummaryById(mineGuid, projectSummaryGuid)
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
          <Link
            to={routes.MINE_PRE_APPLICATIONS.dynamicRoute(
              this.props.formattedProjectSummary.mine_guid
            )}
          >
            <ArrowLeftOutlined className="padding-sm--right" />
            Back to: {this.props.formattedProjectSummary.mine_name} Pre-application submissions
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
                  initialValues={this.props.formattedProjectSummary}
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
    projectSummaryAuthorizationTypes: getTransformedProjectSummaryAuthorizationTypes(state),
    projectSummaryPermitTypesHash: getProjectSummaryPermitTypesHash(state),
    initialValues: getFormattedProjectSummary(state),
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchProjectSummaryById,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ProjectSummary);
