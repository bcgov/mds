import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Menu, Dropdown, Button, Icon, Divider } from "antd";
import MediaQuery from "react-responsive";
import PropTypes from "prop-types";
import * as route from "@/constants/routes";
import * as ENV from "@/constants/environment";
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

export class Authentication extends Component {
  handleLogout = () => {
    signOutFromSiteMinder();
  };

  render() {
    const hamburgerMenu = (
      <Menu>
        <Menu.Item key="my-mines">
          <Button>
            <Link to={route.DASHBOARD.route}>My Mines</Link>
          </Button>
        </Menu.Item>
        <Menu.Item key="manage-users">
          <Button>
            <Link to={route.DASHBOARD.route}>Manage Users</Link>
          </Button>
        </Menu.Item>
        <Divider style={{ margin: "0" }} />
        <Menu.Item key="logout">
          <Button onClick={this.handleLogout}>Log out</Button>
        </Menu.Item>
      </Menu>
    );

    const menu = (
      <Menu className="header-dropdown-menu">
        <Menu.Item key="logout">
          <Button onClick={this.handleLogout} className="header-dropdown-item-button">
            Log out
          </Button>
        </Menu.Item>
      </Menu>
    );

    if (!this.props.isAuthenticated) {
      return (
        <a
          href={`${ENV.KEYCLOAK.loginURL}${ENV.BCEID_LOGIN_REDIRECT_URI}&kc_idp_hint=${ENV.KEYCLOAK.idpHint}`}
        >
          <Button className="login-btn">Log in</Button>
        </a>
      );
    }

    return (
      <div>
        <MediaQuery minWidth={701}>
          <span>
            <Link to={route.DASHBOARD.route} className="header-link">
              My Mines
            </Link>
            <Link to={route.DASHBOARD.route} className="header-link">
              Manage Users
            </Link>
          </span>
          <Dropdown overlay={menu}>
            <Button className="header-dropdown-button">
              {this.props.userInfo.email}
              <Icon type="caret-down" />
            </Button>
          </Dropdown>
        </MediaQuery>
        <MediaQuery maxWidth={700}>
          <Dropdown overlay={hamburgerMenu}>
            <Button className="header-dropdown-button">
              <img src={MENU} alt="menu" />
            </Button>
          </Dropdown>
        </MediaQuery>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  userInfo: getUserInfo(state),
  isAuthenticated: isAuthenticated(state),
});

Authentication.propTypes = propTypes;
Authentication.defaultProps = defaultProps;

export default connect(mapStateToProps)(Authentication);
