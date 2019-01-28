import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Menu, Dropdown, Button, Icon } from "antd";
import * as route from "@/constants/routes";
import PropTypes from "prop-types";
import { SSO_BCEID_LOGIN_ENDPOINT } from "@/constants/API";
import { signOutFromSiteMinder } from "@/actionCreators/authenticationActionCreator";
import { isAuthenticated, getUserInfo } from "@/selectors/authenticationSelectors";

/**
 * @class Logout.js is a small component which contains all keycloak logic to log a user out, NOTE: due to idir issues, Logout does not work as it should.
 */

const propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  userInfo: PropTypes.objectOf(PropTypes.string),
};

const defaultProps = {
  userInfo: {},
};

export const Authentication = (props) => {
  const menu = (
    <Menu>
      <Menu.Item>
        <Button type="tertiary" onClick={signOutFromSiteMinder}>
          Log out
        </Button>
      </Menu.Item>
    </Menu>
  );

  if (!props.isAuthenticated) {
    return (
      <a href={SSO_BCEID_LOGIN_ENDPOINT}>
        <Button type="tertiary" className="login-btn">
          Log in
        </Button>
      </a>
    );
  }
  return (
    <div className="inline align-bot">
      <Link to={route.DASHBOARD.route}>
        <span id="header-link">My Mines</span>
      </Link>
      <Dropdown overlay={menu}>
        <Button ghost id="header-dropdown">
          {props.userInfo.email}
          <Icon type="down" />
        </Button>
      </Dropdown>
    </div>
  );
};

const mapStateToProps = (state) => ({
  userInfo: getUserInfo(state),
  isAuthenticated: isAuthenticated(state),
});

Authentication.propTypes = propTypes;
Authentication.defaultProps = defaultProps;

export default connect(mapStateToProps)(Authentication);
