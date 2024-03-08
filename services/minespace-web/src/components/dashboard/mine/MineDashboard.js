import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Col, Row, Tabs, Typography } from "antd";
import { fetchPartyRelationships } from "@mds/common/redux/actionCreators/partiesActionCreator";
import { fetchEMLIContactsByRegion } from "@mds/common/redux/actionCreators/minespaceActionCreator";
import { bindActionCreators } from "redux";
import { fetchMineRecordById } from "@mds/common/redux/actionCreators/mineActionCreator";
import { getEMLIContactsByRegion } from "@mds/common/redux/selectors/minespaceSelector";
import { getStaticContentLoadingIsComplete } from "@mds/common/redux/selectors/staticContentSelectors";
import * as staticContent from "@mds/common/redux/actionCreators/staticContentActionCreator";
import { getMines } from "@mds/common/redux/selectors/mineSelectors";
import CustomPropTypes from "@/customPropTypes";
import Loading from "@/components/common/Loading";
import Overview from "@/components/dashboard/mine/overview/Overview";
import PermitTabContainer from "@/components/dashboard/mine/permits/PermitTabContainer";
import Variances from "@/components/dashboard/mine/variances/Variances";
import Inspections from "@/components/dashboard/mine/inspections/Inspections";
import Incidents from "@/components/dashboard/mine/incidents/Incidents";
import Reports from "@/components/dashboard/mine/reports/Reports";
import Bonds from "@/components/dashboard/mine/bonds/Bonds";
import Tailings from "@/components/dashboard/mine/tailings/Tailings";
import Projects from "@/components/dashboard/mine/projects/Projects";
import * as router from "@/constants/routes";
import * as Strings from "@/constants/strings";
import NotFoundNotice from "@/components/common/NotFoundNotice";
import NoticesOfDeparture from "@/components/dashboard/mine/noticeOfDeparture/NoticeOfDeparture";
import { getUserAccessData } from "@mds/common/redux/selectors/authenticationSelectors";
import { USER_ROLES } from "@mds/common";

const propTypes = {
  fetchMineRecordById: PropTypes.func.isRequired,
  fetchPartyRelationships: PropTypes.func.isRequired,
  mines: PropTypes.objectOf(CustomPropTypes.mine),
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
      activeTab: PropTypes.string,
    }),
  }).isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  staticContentLoadingIsComplete: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  fetchEMLIContactsByRegion: PropTypes.func.isRequired,
  userRoles: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
  mines: {},
};
const initialTab = "overview";

export class MineDashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoaded: false,
      activeTab: initialTab,
      mineNotFound: false,
      canEditTSF: false,
    };
  }

  componentDidMount() {
    const { id, activeTab } = this.props.match.params;
    this.setState({
      canEditTSF: this.props.userRoles?.some(
        (r) => r === USER_ROLES.role_minespace_proponent || r === USER_ROLES.role_edit_tsf
      ),
    });

    this.loadMine(id, activeTab);
  }

  componentWillReceiveProps(nextProps) {
    const { activeTab, id } = nextProps.match.params;
    const actualActiveTab = this.extractActualTab(activeTab);
    if (activeTab !== this.state.activeTab || !this.state.isLoaded) {
      this.setState({ activeTab: actualActiveTab });
    }
    if (!nextProps.staticContentLoadingIsComplete) {
      this.loadStaticContent();
    }

    if (nextProps.match.params.id !== this.props.match.params.id || !this.state.isLoaded) {
      this.loadMine(id, actualActiveTab);
    }
  }

  extractActualTab = (url) => {
    const delimiterIndex = url.indexOf("?");
    return delimiterIndex !== -1 ? url.substring(0, delimiterIndex) : url;
  };

  loadStaticContent = () => {
    const staticContentActionCreators = Object.getOwnPropertyNames(staticContent).filter(
      (property) => typeof staticContent[property] === "function"
    );
    staticContentActionCreators.forEach((action) => this.props.dispatch(staticContent[action]()));
  };

  handleTabChange = (activeTab) => {
    this.setState({ activeTab });
    this.props.history.push(
      router.MINE_DASHBOARD.dynamicRoute(this.props.match.params.id, activeTab),
      activeTab
    );
  };

  loadMine(id, activeTab) {
    this.setState({ isLoaded: false });

    this.props.fetchPartyRelationships({
      mine_guid: id,
      relationships: "party",
      include_permit_contacts: "true",
    });
    if (activeTab) {
      this.setState({ activeTab });
    } else {
      this.handleTabChange(initialTab);
    }

    this.props
      .fetchMineRecordById(id)
      .then(({ data }) => {
        this.props.fetchEMLIContactsByRegion(data.mine_region, data.major_mine_ind);
      })
      .then(() => {
        this.setState({ isLoaded: true });
      })
      .catch(() => {
        this.setState({ mineNotFound: true });
      });
  }

  render() {
    const { id } = this.props.match.params;
    const mine = this.props.mines[id];
    const isMajorMine = mine?.major_mine_ind;

    if (this.state.mineNotFound) {
      return <NotFoundNotice />;
    }
    return (
      (this.state.isLoaded && this.props.staticContentLoadingIsComplete && (
        <Row>
          <Col span={24}>
            <Row gutter={[0, 48]}>
              <Col span={24}>
                <Typography.Title style={{ marginBottom: 8 }}>
                  {mine.mine_name || Strings.UNKNOWN}
                </Typography.Title>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  Mine Number: {mine.mine_no || Strings.UNKNOWN}
                </Typography.Title>
              </Col>
            </Row>
            <Row gutter={[0, 48]}>
              <Col span={24}>
                <Tabs
                  activeKey={this.state.activeTab}
                  defaultActiveKey={initialTab}
                  onChange={this.handleTabChange}
                  type="card"
                >
                  <Tabs.TabPane tab="Overview" key={initialTab}>
                    <Overview mine={mine} match={this.props.match} />
                  </Tabs.TabPane>
                  {isMajorMine && (
                    <Tabs.TabPane tab="Applications" key="applications">
                      <Projects mine={mine} match={this.props.match} />
                    </Tabs.TabPane>
                  )}
                  <Tabs.TabPane tab="Permits" key="permits">
                    <PermitTabContainer mine={mine} match={this.props.match} />
                  </Tabs.TabPane>

                  <Tabs.TabPane tab="Notices of Departure" key="nods">
                    <NoticesOfDeparture mine={mine} match={this.props.match} />
                  </Tabs.TabPane>
                  <Tabs.TabPane tab="Inspections" key="inspections">
                    <Inspections mine={mine} match={this.props.match} />
                  </Tabs.TabPane>
                  <Tabs.TabPane tab="Incidents" key="incidents">
                    <Incidents mine={mine} match={this.props.match} />
                  </Tabs.TabPane>
                  <Tabs.TabPane tab="Variances" key="variances">
                    <Variances mine={mine} match={this.props.match} />
                  </Tabs.TabPane>
                  <Tabs.TabPane tab="Reports" key="reports">
                    <Reports mine={mine} match={this.props.match} />
                  </Tabs.TabPane>
                  <Tabs.TabPane tab="Bonds" key="bonds">
                    <Bonds mine={mine} match={this.props.match} />
                  </Tabs.TabPane>
                  <Tabs.TabPane tab="Tailings & Dams" key="tailings">
                    <Tailings
                      mine={mine}
                      match={this.props.match}
                      canEditTSF={this.state.canEditTSF}
                    />
                  </Tabs.TabPane>
                </Tabs>
              </Col>
            </Row>
          </Col>
        </Row>
      )) || <Loading />
    );
  }
}

const mapStateToProps = (state) => ({
  mines: getMines(state),
  staticContentLoadingIsComplete: getStaticContentLoadingIsComplete(state),
  EMLIContactsByRegion: getEMLIContactsByRegion(state),
  userRoles: getUserAccessData(state),
});

const mapDispatchToProps = (dispatch) => ({
  dispatch,
  ...bindActionCreators(
    {
      fetchMineRecordById,
      fetchPartyRelationships,
      fetchEMLIContactsByRegion,
    },
    dispatch
  ),
});

MineDashboard.propTypes = propTypes;
MineDashboard.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(MineDashboard);
