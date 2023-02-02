import React from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Button, notification } from "antd";

import { useKeycloak } from "@react-keycloak/web";
import { logoutUser } from "@common/actions/authenticationActions";
import * as router from "@/constants/routes";

import { LOGO_PURPLE } from "@/constants/assets";

const propTypes = {
  logoutUser: PropTypes.func.isRequired,
};

export const Logout = (props) => {
  const { keycloak } = useKeycloak();
  const loggedIn = keycloak.authenticated;

  const handleLogout = () => {
    if (keycloak && keycloak.logout) {
      keycloak.logout();
    }
    if (props.logoutUser) {
      props.logoutUser();
    }
  };

  if (loggedIn) {
    handleLogout();
  } else {
    notification.success({
      message: "You have successfully logged out of Core",
      duration: 10,
    });
  }

  return (
    !loggedIn && (
      <div className="logout-screen">
        <img alt="mine_img" src={LOGO_PURPLE} />
        <p>If you would like to return to Core, please log in below</p>
        <Link to={router.MINE_HOME_PAGE.route}>
          <Button className="full-mobile" type="primary">
            Log In
          </Button>
        </Link>
      </div>
    )
  );
};

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      logoutUser,
    },
    dispatch
  );

Logout.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(Logout);
