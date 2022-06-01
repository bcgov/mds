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
import InformationRequirementsTablePage from "./InformationRequirementsTablePage";

const propTypes = {
  mines: PropTypes.arrayOf(CustomPropTypes.mine).isRequired,
  project: CustomPropTypes.project.isRequired,
  fetchProjectById: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  fetchEMLIContactsByRegion: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: {
      mineGuid: PropTypes.string,
    },
  }).isRequired,
  history: PropTypes.shape({ push: PropTypes.func, replace: PropTypes.func }).isRequired,
};

const tabs = ["overview", "irt", "toc", "application"];

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
          return this.props.fetchMineRecordById(this.props.project.mine_guid);
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

  handleTabChange = (activeTab) => {
    this.setState({ activeTab });
    const url = router.EDIT_PROJECT.dynamicRoute(this.props.match.params?.projectGuid, activeTab);
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
              <Tabs defaultActiveKey={tabs[0]} onChange={this.handleTabChange} type="card">
                <Tabs.TabPane tab="Overview" key="overview">
                  <ProjectOverviewTab />
                </Tabs.TabPane>
                {!IN_PROD() && (
                  <Tabs.TabPane tab="IRT" key="irt">
                    <InformationRequirementsTablePage match={this.props.match} />
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
