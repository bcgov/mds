/* eslint-disable */
import React, { Component } from "react";
import { bindActionCreators, compose } from "redux";
import { connect } from "react-redux";
import { kebabCase } from "lodash";
import { getFormValues, reduxForm } from "redux-form";
import * as routes from "@/constants/routes";
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
import * as router from "@/constants/routes";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
// import ProjectSummaryPageHeader from "@/components/mine/ProjectSummaries/ProjectSummaryPageHeader";
import ProjectSummarySideMenu from "@/components/mine/ProjectSummaries/ProjectSummarySideMenu";
import { ProjectSummaryForm } from "@/components/Forms/projectSummaries/ProjectSummaryForm";
import * as Permission from "@/constants/permissions";
import { AuthorizationGuard } from "@/HOC/AuthorizationGuard";
import CustomPropTypes from "@/customPropTypes";
import NullScreen from "@/components/common/NullScreen";
import { ArrowLeftOutlined, EnvironmentOutlined } from "@ant-design/icons";

const propTypes = {
  projectSummary: CustomPropTypes.projectSummary,
  projectSummaryStatusCodeHash: PropTypes.objectOf(PropTypes.string).isRequired,
  getProjectSummaryDocumentTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  projectSummaryPermitTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

const defaultProps = {
  projectSummary: {},
};

export class ProjectSummary extends Component {
  state = {
    isLoaded: false,
    fixedTop: false,
    isTabLoaded: false,
    isValid: true,
    activeTab: "project-descriptions",
  };

  componentDidMount() {
    this.handleFetchData(this.props.match.params);
    window.addEventListener("scroll", this.handleScroll);
    this.handleScroll();
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  }

  componentDidUpdate(nextProps) {
    if (nextProps.match.params.projectSummaryGuid !== this.props.match.params.projectSummaryGuid) {
      this.handleFetchData(nextProps.match.params);
    }
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
        .then(() => {
          this.setState({ isLoaded: true, isValid: true });
        })
        .catch(() => {
          this.setState({ isLoaded: false, isValid: false });
        });
    }
  };

  handleTabChange = (key) => {
    this.props.history.replace(
      routes.PRE_APPLICATIONS.dynamicRoute(
        this.props.noticeOfWork.now_application_guid,
        kebabCase(key)
      )
    );
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
                  to={router.MINE_GENERAL.dynamicRoute(
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
            to={router.MINE_PRE_APPLICATIONS.dynamicRoute(
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
          onTabClick={this.handleTabChange}
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
ProjectSummary.defaultProps = defaultProps;

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

// export default compose(
//   connect(mapStateToProps, mapDispatchToProps),
//   reduxForm({
//     form: FORM.PROJECT_SUMMARY,
//     enableReinitialize: true,
//   })
// )(ProjectSummary);

export default connect(mapStateToProps, mapDispatchToProps)(ProjectSummary);
