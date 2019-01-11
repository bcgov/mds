import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { logoutUser } from "@/actions/authenticationActions";
import { getKeycloak } from "@/selectors/authenticationSelectors";

/**
 * @class Logout.js is a small component which contains all keycloak logic to log a user out, NOTE: due to idir issues, Logout does not work as it should.
 */

const propTypes = {
  logoutUser: PropTypes.func.isRequired,
  keycloak: { logout: PropTypes.func.isRequired }.isRequired,
};

export class Logout extends Component {
  handleLogout = () => {
    this.props.keycloak.logout();
    localStorage.removeItem("jwt");
    this.props.logoutUser();
  };

  render() {
    return (
      <button type="button" onClick={this.handleLogout}>
        Logout
      </button>
    );
  }
}

const mapStateToProps = (state) => ({
  keycloak: getKeycloak(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      logoutUser,
    },
    dispatch
  );

Logout.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Logout);
