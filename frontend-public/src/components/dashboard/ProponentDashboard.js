import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { getUserInfo } from "@/selectors/authenticationSelectors";

const propTypes = {
  userInfo: PropTypes.objectOf(PropTypes.string).isRequired,
};

// This file is anticipated to use state
// eslint-disable-next-line react/prefer-stateless-function
export class ProponentDashboard extends Component {
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
});

ProponentDashboard.propTypes = propTypes;

export default connect(mapStateToProps)(ProponentDashboard);
