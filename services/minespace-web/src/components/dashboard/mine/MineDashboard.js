import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Row, Col, Tabs, Typography } from "antd";
import { bindActionCreators } from "redux";
import { fetchMineRecordById } from "@/actionCreators/userDashboardActionCreator";
import { getMine } from "@/selectors/userMineSelectors";
import Loading from "@/components/common/Loading";
import CustomPropTypes from "@/customPropTypes";
import Overview from "@/components/dashboard/mine/overview/Overview";
import Permits from "@/components/dashboard/mine/permits/Permits";
import Variances from "@/components/dashboard/mine/variances/Variances";
import Inspections from "@/components/dashboard/mine/inspections/Inspections";
import Incidents from "@/components/dashboard/mine/incidents/Incidents";
import Reports from "@/components/dashboard/mine/reports/Reports";

const { Title } = Typography;
const { TabPane } = Tabs;

const propTypes = {
  fetchMineRecordById: PropTypes.func.isRequired,
  mine: CustomPropTypes.mine.isRequired,
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
};

export class MineDashboard extends Component {
  state = { isLoaded: false };

  componentDidMount() {
    const { id } = this.props.match.params;
    this.props.fetchMineRecordById(id).then(() => {
      this.setState({ isLoaded: true });
    });
  }

  render() {
    return (
      (this.state.isLoaded && (
        <div>
          <Row gutter={[0, 48]}>
            <Col>
              <Title>{this.props.mine.mine_name}</Title>
            </Col>
          </Row>
          <Row gutter={[0, 48]}>
            <Col>
              <Tabs defaultActiveKey="overview" type="card">
                <TabPane tab="Overview" key="overview">
                  <Overview mine={this.props.mine} />
                </TabPane>
                <TabPane tab="Permits" key="permits">
                  <Permits mine={this.props.mine} />
                </TabPane>
                <TabPane tab="Variances" key="variances">
                  <Variances mine={this.props.mine} />
                </TabPane>
                <TabPane tab="Inspections" key="inspections">
                  <Inspections mine={this.props.mine} />
                </TabPane>
                <TabPane tab="Incidents" key="incidents">
                  <Incidents mine={this.props.mine} />
                </TabPane>
                <TabPane tab="Reports" key="reports">
                  <Reports mine={this.props.mine} />
                </TabPane>
              </Tabs>
            </Col>
          </Row>
        </div>
      )) || <Loading />
    );
  }
}

const mapStateToProps = (state) => ({
  mine: getMine(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineRecordById,
    },
    dispatch
  );

MineDashboard.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(MineDashboard);
