import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Menu, Dropdown, Button, Icon, Divider } from "antd";
import * as route from "@/constants/routes";
import MediaQuery from "react-responsive";
import PropTypes from "prop-types";
import { SSO_BCEID_LOGIN_ENDPOINT } from "@/constants/API";
import { signOutFromSiteMinder } from "@/utils/authenticationHelpers";
import { isAuthenticated, getUserInfo } from "@/selectors/authenticationSelectors";
import { MENU } from "@/constants/assets";

/**
 * @class Authentication.js contains various authentication states, and available links for authenticated users,
 * MediaQueries are used to switch the menu to a hamburger menu when viewed on mobile.
 */

const propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  userInfo: PropTypes.objectOf(PropTypes.string),
};

const defaultProps = {
  userInfo: {},
};

export const Authentication = (props) => {
  const hamburgerMenu = (
    <Menu>
      <Menu.Item>
        <Button type="tertiary">
          <Link to={route.DASHBOARD.route}>My Mines</Link>
        </Button>
      </Menu.Item>
      <Divider style={{ margin: "0" }} />
      <Menu.Item>
        <Button type="tertiary" onClick={signOutFromSiteMinder}>
          Log out
        </Button>
      </Menu.Item>
    </Menu>
  );

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
      <MediaQuery minWidth={701}>
        <Link to={route.DASHBOARD.route}>
          <span className="header-link">My Mines</span>
        </Link>
        <Dropdown overlay={menu}>
          <Button ghost className="header-dropdown">
            {props.userInfo.email}
            <Icon type="down" />
          </Button>
        </Dropdown>
      </MediaQuery>
      <MediaQuery maxWidth={700}>
        <Dropdown overlay={hamburgerMenu}>
          <Button ghost className="header-dropdown">
            <img src={MENU} alt="menu" />
          </Button>
        </Dropdown>
      </MediaQuery>
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
