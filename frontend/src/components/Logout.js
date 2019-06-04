import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { getKeycloak } from "@/selectors/authenticationSelectors";
import { logoutUser } from "@/actions/authenticationActions";

const propTypes = {
  logoutUser: PropTypes.func.isRequired,
  keycloak: { logout: PropTypes.func }.isRequired,
};

export class Logout extends Component {
  componentDidMount() {
    this.handleLogout();
  }

  handleLogout = () => {
    if (this.props.keycloak && this.props.keycloak.logout) {
      this.props.keycloak.logout();
    }
    if (this.props.logoutUser) {
      this.props.logoutUser();
    }
    localStorage.removeItem("jwt");
  };

  render() {
    return <h1>You logged out. So happy for you.</h1>;
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
