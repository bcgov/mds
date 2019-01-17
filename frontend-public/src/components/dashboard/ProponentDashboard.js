import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";

import { getUserInfo } from "@/selectors/authenticationSelectors";
import { getUserMineInfo } from "@/selectors/userMineInfoSelector";
import { fetchUserMineInfo } from "@/actionCreators/userDashboardActionCreator";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  userInfo: PropTypes.objectOf(PropTypes.string).isRequired,
  fetchUserMineInfo: PropTypes.func.isRequired,
  userMineInfo: PropTypes.objectOf(CustomPropTypes.userMines).isRequired,
};

// This file is anticipated to use state
// eslint-disable-next-line react/prefer-stateless-function
export class ProponentDashboard extends Component {
  componentDidMount() {
    this.props.fetchUserMineInfo();
  }

  render() {
    return (
      <div>
        <h1> Welcome, {this.props.userInfo.preferred_username}.</h1>
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
