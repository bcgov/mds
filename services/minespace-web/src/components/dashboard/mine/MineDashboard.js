import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Row, Col, Tabs, Typography } from "antd";
import { bindActionCreators } from "redux";
import { fetchMineRecordById } from "@common/actionCreators/mineActionCreator";
import { fetchPartyRelationships } from "@common/actionCreators/partiesActionCreator";
import { getStaticContentLoadingIsComplete } from "@common/selectors/staticContentSelectors";
import * as staticContent from "@common/actionCreators/staticContentActionCreator";
import { getMines } from "@common/selectors/mineSelectors";
import CustomPropTypes from "@/customPropTypes";
import Loading from "@/components/common/Loading";
import Overview from "@/components/dashboard/mine/overview/Overview";
import Permits from "@/components/dashboard/mine/permits/Permits";
import Variances from "@/components/dashboard/mine/variances/Variances";
import Inspections from "@/components/dashboard/mine/inspections/Inspections";
import Incidents from "@/components/dashboard/mine/incidents/Incidents";
import Reports from "@/components/dashboard/mine/reports/Reports";
import * as router from "@/constants/routes";
import * as Strings from "@/constants/strings";
import NotFoundNotice from "@/components/common/NotFoundNotice";

const { Title } = Typography;
const { TabPane } = Tabs;

const propTypes = {
  fetchMineRecordById: PropTypes.func.isRequired,
  fetchPartyRelationships: PropTypes.func.isRequired,
  mines: PropTypes.objectOf(CustomPropTypes.mine),
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  staticContentLoadingIsComplete: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
};

const defaultProps = {
  mines: {},
};
const initialTab = "overview";

export class MineDashboard extends Component {
  state = { isLoaded: false, activeTab: initialTab, mineNotFound: false };

  componentDidMount() {
    const { id, activeTab } = this.props.match.params;
    this.props.fetchPartyRelationships({ mine_guid: id, relationships: "party" });
    if (activeTab) {
      this.setState({ activeTab });
    } else {
      this.handleTabChange(initialTab);
    }
    this.props
      .fetchMineRecordById(id)
      .then(() => {
        this.setState({ isLoaded: true });
      })
      .catch((err) => {
        this.setState({ mineNotFound: true });
      });
  }

  componentWillReceiveProps(nextProps) {
    const { activeTab } = nextProps.match.params;
    if (activeTab !== this.state.activeTab) {
      this.setState({ activeTab });
    }
    if (!nextProps.staticContentLoadingIsComplete) {
      this.loadStaticContent();
    }
  }

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

  render() {
    const { id } = this.props.match.params;
    const mine = this.props.mines[id];
    if (this.state.mineNotFound) {
      return <NotFoundNotice />;
    }
    return (
      (this.state.isLoaded && this.props.staticContentLoadingIsComplete && (
        <Row>
          <Col>
            <Row gutter={[0, 48]}>
              <Col>
                <Title style={{ marginBottom: 8 }}>{mine.mine_name || Strings.UNKNOWN}</Title>
                <Title level={4} style={{ margin: 0 }}>
                  Mine Number: {mine.mine_no || Strings.UNKNOWN}
                </Title>
              </Col>
            </Row>
            <Row gutter={[0, 48]}>
              <Col>
                <Tabs
                  activeKey={this.state.activeTab}
                  defaultActiveKey={initialTab}
                  onChange={this.handleTabChange}
                  type="card"
                >
                  <TabPane tab="Overview" key={initialTab}>
                    <Overview mine={mine} match={this.props.match} />
                  </TabPane>
                  {mine.major_mine_ind && (
                    <TabPane tab="Permits" key="permits">
                      <Permits mine={mine} match={this.props.match} />
                    </TabPane>
                  )}
                  <TabPane tab="Inspections" key="inspections">
                    <Inspections mine={mine} match={this.props.match} />
                  </TabPane>
                  <TabPane tab="Incidents" key="incidents">
                    <Incidents mine={mine} match={this.props.match} />
                  </TabPane>
                  <TabPane tab="Variances" key="variances">
                    <Variances mine={mine} match={this.props.match} />
                  </TabPane>
                  <TabPane tab="Reports" key="reports">
                    <Reports mine={mine} match={this.props.match} />
                  </TabPane>
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
});

const mapDispatchToProps = (dispatch) => ({
  dispatch,
  ...bindActionCreators(
    {
      fetchMineRecordById,
      fetchPartyRelationships,
    },
    dispatch
  ),
});

MineDashboard.propTypes = propTypes;
MineDashboard.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(MineDashboard);
