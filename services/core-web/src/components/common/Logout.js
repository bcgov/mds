import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Button, notification } from "antd";

import { getKeycloak } from "@common/selectors/authenticationSelectors";
import { logoutUser } from "@common/actions/authenticationActions";
import * as router from "@/constants/routes";

import { LOGO_PURPLE } from "@/constants/assets";

const propTypes = {
  logoutUser: PropTypes.func.isRequired,
  keycloak: { logout: PropTypes.func }.isRequired,
};

export class Logout extends Component {
  loggedIn = (this.props.keycloak && this.props.keycloak.logout) || localStorage.getItem("jwt");

  componentDidMount() {
    if (this.loggedIn) {
      this.handleLogout();
    } else {
      notification.success({
        message: "You have successfully logged out of Core",
        duration: 10,
      });
    }
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
    return (
      !this.loggedIn && (
        <div className="logout-screen">
          <img alt="mine_img" src={LOGO_PURPLE} />
          <p>If you would like to return to CORE, please log in below</p>
          <Link to={router.MINE_HOME_PAGE.route}>
            <Button className="full-mobile" type="primary">
              Log In
            </Button>
          </Link>
        </div>
      )
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
