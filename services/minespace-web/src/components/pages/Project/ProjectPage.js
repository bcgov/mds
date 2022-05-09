import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Link } from "react-router-dom";
import { Row, Col, Typography, Tabs, Divider } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { getMines } from "@common/selectors/mineSelectors";
import {
  getProjectSummary,
  getFormattedProjectSummary,
  getProject,
} from "@common/selectors/projectSelectors";
import { fetchProjectById } from "@common/actionCreators/projectActionCreator";
import { fetchMineRecordById } from "@common/actionCreators/mineActionCreator";
import { clearProjectSummary, clearProject } from "@common/actions/projectActions";
import Loading from "@/components/common/Loading";
import ProjectOverviewTab from "./ProjectOverviewTab";
import { MINE_DASHBOARD, EDIT_PROJECT } from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  mines: PropTypes.arrayOf(CustomPropTypes.mine).isRequired,
  projectSummary: CustomPropTypes.projectSummary,
  fetchProjectSummaryById: PropTypes.func.isRequired,
  createProjectSummary: PropTypes.func.isRequired,
  updateProjectSummary: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  fetchEMLIContactsByRegion: PropTypes.func.isRequired,
  clearProjectSummary: PropTypes.func.isRequired,
  clearProject: PropTypes.func.isRequired,
  projectSummaryDocumentTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  match: PropTypes.shape({
    params: {
      mineGuid: PropTypes.string,
    },
  }).isRequired,
  history: PropTypes.shape({ push: PropTypes.func, replace: PropTypes.func }).isRequired,
  submit: PropTypes.func.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  formValueSelector: PropTypes.func.isRequired,
  projectSummaryAuthorizationTypesArray: PropTypes.arrayOf(PropTypes.any).isRequired,
  formattedProjectSummary: PropTypes.objectOf(PropTypes.any).isRequired,
  location: PropTypes.shape({ pathname: PropTypes.string }).isRequired,
  EMLIcontactInfo: PropTypes.arrayOf(CustomPropTypes.EMLIContactInfo).isRequired,
};

const defaultProps = {
  project: {},
};

const tabs = ["overview", "irt", "toc", "application"];

export class ProjectPage extends Component {
  state = {
    isLoaded: true,
    activeTab: tabs[0],
  };

  componentDidMount() {
    const { projectGuid } = this.props.match?.params;
    if (projectGuid) {
      return this.props.fetchProjectById(projectGuid).then(() => {
        this.props.fetchMineRecordById(this.props.project.mine_guid);
        this.setState({ isLoaded: true, activeTab: tabs.indexOf(this.props.match.params.tab) });
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    const { activeTab } = nextProps.match.params;
    if (activeTab !== this.state.activeTab) {
      this.setState({ activeTab });
    }
  }

  handleTabChange = (activeTab) => {
    const url = EDIT_PROJECT.dynamicRoute(this.props.match.params?.projectGuid, activeTab);
    this.setState({ activeTab });
    this.props.history.push(url);
  };

  render() {
    const mineGuid = this.props.project.mine_guid;
    const mineName = this.props.mines[mineGuid]?.mine_name || "";
    const title = this.props.project?.project_title;

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
                activeKey={this.state.activeTab}
                defaultActiveKey="overview"
                onChange={this.handleTabChange}
                type="card"
              >
                <Tabs.TabPane tab="Overview" key={this.state.activeTab}>
                  <ProjectOverviewTab project={this.props.project} mines={this.props.mines} />
                </Tabs.TabPane>
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
  projectSummary: getProjectSummary(state),
  formattedProjectSummary: getFormattedProjectSummary(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineRecordById,
      clearProjectSummary,
      clearProject,
      fetchProjectById,
    },
    dispatch
  );

ProjectPage.propTypes = propTypes;
ProjectPage.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(ProjectPage);
