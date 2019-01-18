import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { Row, Col } from "antd";
import { Link } from "react-router-dom";

import { getUserInfo } from "@/selectors/authenticationSelectors";
import { getUserMineInfo } from "@/selectors/userMineInfoSelector";
import { fetchUserMineInfo } from "@/actionCreators/userDashboardActionCreator";
import CustomPropTypes from "@/customPropTypes";
import QuestionSidebar from "@/components/common/QuestionsSidebar";
import * as routes from "@/constants/routes";

const propTypes = {
  userInfo: PropTypes.objectOf(PropTypes.string).isRequired,
  fetchUserMineInfo: PropTypes.func.isRequired,
  userMineInfo: CustomPropTypes.userMines.isRequired,
};

// This file is anticipated to use state
// eslint-disable-next-line react/prefer-stateless-function
export class ProponentDashboard extends Component {
  componentDidMount() {
    this.props.fetchUserMineInfo();
  }

  render() {
    const mines = this.props.userMineInfo ? this.props.userMineInfo.mines : [];
    return (
      <div className="user-dashboard-padding">
        <Row gutter={16}>
          <Col xs={1} sm={1} md={2} lg={4} />
          <Col xs={22} sm={22} md={14} lg={12}>
            <div>
              <h1 className="user-title"> Welcome, {this.props.userInfo.preferred_username}.</h1>
              <p className="large-padding-bot">
                You are authorized to submit information for the following mines:
              </p>
            </div>
            <ul className="user-mine-list">
              {mines &&
                mines.map((mine) => (
                  <li>
                    <Link to={routes.MINE_INFO.dynamicRoute(mine.guid)}>{mine.mine_name}</Link>
                  </li>
                ))}
            </ul>
            <p className="large-padding-top">
              Don't see the mine you are looking for? Contact{" "}
              <a href="mailto:MDS@gov.bc.ca">MDS@gov.bc.ca</a> for assistance.
            </p>
          </Col>
          <Col xs={22} sm={22} md={6} lg={4}>
            <QuestionSidebar />
          </Col>
          <Col xs={1} sm={1} md={2} lg={4} />
        </Row>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  userInfo: getUserInfo(state),
  userMineInfo: getUserMineInfo(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchUserMineInfo,
    },
    dispatch
  );

ProponentDashboard.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProponentDashboard);
