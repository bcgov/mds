import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Button } from "antd";
import PropTypes from "prop-types";
import * as routes from "@/constants/routes";
import { logoutUser } from "@/actions/authenticationActions";
import { getKeycloak, isAuthenticated } from "@/selectors/authenticationSelectors";

/**
 * @class Logout.js is a small component which contains all keycloak logic to log a user out, NOTE: due to idir issues, Logout does not work as it should.
 */

const propTypes = {
  logoutUser: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  keycloak: { logout: PropTypes.func.isRequired }.isRequired,
};

export class Authentication extends Component {
  handleLogout = () => {
    this.props.keycloak.logout();
    localStorage.removeItem("jwt");
    this.props.logoutUser();
  };

  render() {
    if (!this.props.isAuthenticated) {
      return (
        <Link to={routes.DASHBOARD.route}>
          <Button type="secondary" className="login-btn">
            Log in
          </Button>
        </Link>
      );
    }
    return (
      <Button type="secondary" className="login-btn" onClick={this.handleLogout}>
        Logout
      </Button>
    );
  }
}

const mapStateToProps = (state) => ({
  keycloak: getKeycloak(state),
  isAuthenticated: isAuthenticated(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      logoutUser,
    },
    dispatch
  );

Authentication.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Authentication);
