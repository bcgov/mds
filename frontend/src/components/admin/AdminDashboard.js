import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

/**
 * @class AdminDashboard - private component for Admin
 */

const propTypes = {
  // userInfo: PropTypes.shape({ preferred_username: PropTypes.string.isRequired }).isRequired,
};

export class AdminDashboard extends Component {
  render() {
    return (
      <div>
        <h1>Hello Admin</h1>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  // userInfo: getUserInfo(state),
});

AdminDashboard.propTypes = propTypes;

export default connect(
  mapStateToProps,
  null
)(AdminDashboard);
