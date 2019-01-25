import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { Row, Col } from "antd";
import { Link } from "react-router-dom";

import { getUserInfo } from "@/selectors/authenticationSelectors";
import { getUserMineInfo } from "@/selectors/userMineInfoSelector";
import { fetchUserMineInfo } from "@/actionCreators/userDashboardActionCreator";
import NullScreen from "@/components/common/NullScreen";
import CustomPropTypes from "@/customPropTypes";
import QuestionSidebar from "@/components/common/QuestionsSidebar";
import Loading from "@/components/common/Loading";
import * as routes from "@/constants/routes";

const propTypes = {
  userInfo: PropTypes.objectOf(PropTypes.string).isRequired,
  fetchUserMineInfo: PropTypes.func.isRequired,
  userMineInfo: CustomPropTypes.userMines.isRequired,
};

// This file is anticipated to use state
// eslint-disable-next-line react/prefer-stateless-function
export class UserDashboard extends Component {
  state = { isLoaded: false };

  componentDidMount() {
    this.props.fetchUserMineInfo().then(() => this.setState({ isLoaded: true }));
  }

  render() {
    if (!this.state.isLoaded) {
      return <Loading />;
    }
    const { mines } = this.props.userMineInfo;
    return (
      <div className="user-dashboard-padding">
        {mines.length > 0 && (
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
                {mines.map((mine) => (
                  <li key={mine.guid}>
                    <Link to={routes.MINE_INFO.dynamicRoute(mine.guid)}>{mine.mine_name}</Link>
                  </li>
                ))}
              </ul>
              <p className="large-padding-top">
                Don&#39;t see the mine you are looking for? Contact{" "}
                <a href="mailto:MDS@gov.bc.ca">MDS@gov.bc.ca</a> for assistance.
              </p>
            </Col>
            <Col xs={22} sm={22} md={6} lg={4}>
              <QuestionSidebar />
            </Col>
            <Col xs={1} sm={1} md={2} lg={4} />
          </Row>
        )}
        {mines.length === 0 && <NullScreen type="no-mines" />}
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

UserDashboard.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserDashboard);
