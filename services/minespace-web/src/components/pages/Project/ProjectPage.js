import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Link } from "react-router-dom";
import { Row, Col, Typography, Tabs } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { detectProdEnvironment as IN_PROD } from "@common/utils/environmentUtils";
import { getMines } from "@common/selectors/mineSelectors";
import { getProject } from "@common/selectors/projectSelectors";
import { fetchProjectById } from "@common/actionCreators/projectActionCreator";
import { fetchMineRecordById } from "@common/actionCreators/mineActionCreator";
import { fetchEMLIContactsByRegion } from "@common/actionCreators/minespaceActionCreator";
import Loading from "@/components/common/Loading";
import { MINE_DASHBOARD } from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";
import * as router from "@/constants/routes";
import ProjectOverviewTab from "./ProjectOverviewTab";
import InformationRequirementsTableEntryTab from "./InformationRequirementsTableEntryTab";
import MajorMineApplicationEntryTab from "./MajorMineApplicationEntryTab";
import DocumentsTab from "./DocumentsTab";

const propTypes = {
  mines: PropTypes.arrayOf(CustomPropTypes.mine).isRequired,
  project: CustomPropTypes.project.isRequired,
  fetchProjectById: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  fetchEMLIContactsByRegion: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      mineGuid: PropTypes.string,
      tab: PropTypes.string,
      activeTab: PropTypes.string,
      projectGuid: PropTypes.string,
    }),
  }).isRequired,
  history: PropTypes.shape({ push: PropTypes.func, replace: PropTypes.func }).isRequired,
};

const tabs = ["overview", "irt-entry", "toc", "application", "documents"];

export class ProjectPage extends Component {
  state = {
    isLoaded: false,
    activeTab: tabs[0],
  };

  componentDidMount() {
    const { projectGuid } = this.props.match?.params;
    if (projectGuid) {
      this.props
        .fetchProjectById(projectGuid)
        .then(() => {
          if (this.props?.project?.mine_guid) {
            return this.props.fetchMineRecordById(this.props.project.mine_guid);
          }
          return null;
        })
        .then(({ data }) => {
          this.props.fetchEMLIContactsByRegion(data.mine_region, data.major_mine_ind);
          this.setState({
            isLoaded: true,
            activeTab: tabs.indexOf(this.props.match.params.tab),
          });
        });
    }
    return null;
  }

  componentWillReceiveProps(nextProps) {
    const { activeTab } = nextProps.match.params;
    if (activeTab !== this.state.activeTab) {
      this.setState({ activeTab });
    }
  }

  handleTabChange = (activeTab, irtStatus) => {
    this.setState({ activeTab });
    if (activeTab === "overview") {
      const url = router.EDIT_PROJECT.dynamicRoute(this.props.match.params?.projectGuid, activeTab);
      this.props.history.push(url);
    } else if (activeTab === "irt-entry") {
      const url =
        irtStatus === "APV"
          ? router.REVIEW_INFORMATION_REQUIREMENTS_TABLE.dynamicRoute(
              this.props.project.project_guid,
              this.props.project.information_requirements_table?.irt_guid
            )
          : `/projects/${this.props.match.params?.projectGuid}/information-requirements-table/entry`;
      const urlState = irtStatus === "APV" ? { state: { current: 2 } } : {};
      this.props.history.push({ pathname: url, ...urlState });
    } else if (activeTab === "new") {
      const url = router.ADD_INFORMATION_REQUIREMENTS_TABLE.dynamicRoute(
        this.props.match.params?.projectGuid
      );
      this.props.history.push(url);
    } else if (activeTab === "mma-entry") {
      const url = `/projects/${this.props.match.params?.projectGuid}/major-mine-application/entry`;
      this.props.history.push(url);
    } else if (activeTab === "documents") {
      const url = `/projects/${this.props.match.params?.projectGuid}/documents`;
      this.props.history.push({ pathname: url });
    }
  };

  navigateFromProjectStagesTable = (source, status) => {
    if (source === "IRT") {
      if (status === "APV") {
        return this.props.history.push({
          pathname: router.REVIEW_INFORMATION_REQUIREMENTS_TABLE.dynamicRoute(
            this.props.project.project_guid,
            this.props.project.information_requirements_table?.irt_guid
          ),
          state: { current: 2 },
        });
      }
      const irtTab = document.querySelector('[id*="irt-entry"]');
      if (!irtTab) {
        return null;
      }
      return irtTab.click();
    }
    if (source === "MMA") {
      const mmaTab = document.querySelector('[id*="major-mine-application"]');
      if (!mmaTab) {
        return null;
      }
      return mmaTab.click();
    }
    return null;
  };

  navigateFromMMAButton = (status) => {
    if (status === "APV") {
      return this.props.history.push({
        pathname: router.EDIT_MAJOR_MINE_APPLICATION.dynamicRoute(
          this.props.project.project_guid,
          this.props.project.major_mine_application?.major_mine_application_guid
        ),
        state: { current: 2 },
      });
    }
    const mmaTab = document.querySelector('[id*="application"]');
    if (!mmaTab) {
      return null;
    }
    return mmaTab.click();
  };

  render() {
    const mineGuid = this.props.project.mine_guid;
    const mineName = this.props.mines[mineGuid]?.mine_name || "";
    const title = this.props.project?.project_title;
    const irtStatus = this.props.project.information_requirements_table?.status_code;
    const mmaStatus = this.props.project.major_mine_application?.status_code;
    const mrcReviewRequired = this.props.project?.mrc_review_required;

    return (
      (this.state.isLoaded && (
        <>
          <Row>
            <Col span={24}>
              <Typography.Title>{title}</Typography.Title>
            </Col>
          </Row>
          <Row gutter={[0, 16]}>
            <Col span={24}>
              <Link to={MINE_DASHBOARD.dynamicRoute(mineGuid, "applications")}>
                <ArrowLeftOutlined className="padding-sm--right" />
                Back to: {mineName} Mine Projects
              </Link>
            </Col>
          </Row>
          <Row gutter={[0, 16]}>
            <Col span={24}>
              <Tabs
                defaultActiveKey={tabs[0]}
                onChange={(activeTab) => this.handleTabChange(activeTab, irtStatus, mmaStatus)}
                type="card"
              >
                <Tabs.TabPane tab="Overview" key="overview">
                  <ProjectOverviewTab navigateForward={this.navigateFromProjectStagesTable} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="IRT" key="irt-entry">
                  <InformationRequirementsTableEntryTab
                    irt={this.props.project?.information_requirements_table}
                    mrcReviewRequired={mrcReviewRequired}
                  />
                </Tabs.TabPane>
                {!IN_PROD() && (
                  <Tabs.TabPane tab="Application" key="major-mine-application">
                    <MajorMineApplicationEntryTab
                      mma={this.props.project?.major_mine_application}
                    />
                  </Tabs.TabPane>
                )}
                {!IN_PROD() && (
                  <Tabs.TabPane tab="Documents" key="documents">
                    <DocumentsTab project={this.props.project} />
                  </Tabs.TabPane>
                )}
              </Tabs>
            </Col>
          </Row>
        </>
      )) || <Loading />
    );
  }
}

const mapStateToProps = (state) => ({
  mines: getMines(state),
  project: getProject(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineRecordById,
      fetchProjectById,
      fetchEMLIContactsByRegion,
    },
    dispatch
  );

ProjectPage.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(ProjectPage);
