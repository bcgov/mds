import React, { Component } from "react";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import { CaretDownOutlined } from "@ant-design/icons";
import { Menu, Dropdown, Button, Divider } from "antd";
import MediaQuery from "react-responsive";
import PropTypes from "prop-types";
import * as COMMON_ENV from "@common/constants/environment";
import * as route from "@/constants/routes";
import * as MINESPACE_ENV from "@/constants/environment";
import { signOutFromSiteMinder } from "@/utils/authenticationHelpers";
import { isAuthenticated, getUserInfo } from "@/selectors/authenticationSelectors";
import { MENU } from "@/constants/assets";
import AuthorizationWrapper from "../common/wrappers/AuthorizationWrapper";
import { AuthorizationGuard } from "@/HOC/AuthorizationGuard";

/**
 * @class HeaderDropdown.js contains various authentication states, and available links for authenticated users,
 * MediaQueries are used to switch the menu to a hamburger menu when viewed on mobile.
 */
const propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  location: PropTypes.shape({ pathname: PropTypes.string }).isRequired,
  userInfo: PropTypes.objectOf(PropTypes.string),
};

const defaultProps = {
  userInfo: {},
};

export class HeaderDropdown extends Component {
  handleLogout = () => {
    signOutFromSiteMinder();
  };

  setActiveLink = (pathname) => {
    return this.props.location.pathname === pathname ? "header-link active" : "header-link";
  };

  render() {
    const menuItemLogout = (
      <Menu.Item key="logout">
        <Button className="header-dropdown-item-button" onClick={this.handleLogout}>
          Log out
        </Button>
      </Menu.Item>
    );
    const dropdownMenuMobile = (
      <Menu className="header-dropdown-menu">
        <AuthorizationWrapper>
          <Menu.Item key="mines">
            <Button className="header-dropdown-item-button">
              <Link to={route.MINES.route}>My Mines</Link>
            </Button>
          </Menu.Item>
        </AuthorizationWrapper>
        {/* Disabled until we implement this */}
        {/* <Menu.Item key="users">
          <Button className="header-dropdown-item-button">
            <Link to={route.USERS.route}>My Users</Link>
          </Button>
        </Menu.Item> */}
        <Divider className="bg-color-table-seperator" style={{ margin: 0 }} />
        {menuItemLogout}
      </Menu>
    );
    const dropdownMenuDesktop = <Menu className="header-dropdown-menu">{menuItemLogout}</Menu>;
    if (!this.props.isAuthenticated) {
      return (
        <div>
          <Button className="login-btn" style={{ "margin-right": "10px" }}>
            <a
              href={`${COMMON_ENV.KEYCLOAK.loginURL}${MINESPACE_ENV.BCEID_LOGIN_REDIRECT_URI}&kc_idp_hint=${COMMON_ENV.KEYCLOAK.bceid_idpHint}`}
            >
              Log in with BCeID
            </a>
          </Button>
          <AuthorizationGuard inTesting>
            <Button className="login-btn">
              <a
                href={`${COMMON_ENV.KEYCLOAK.loginURL}${MINESPACE_ENV.BCEID_LOGIN_REDIRECT_URI}&kc_idp_hint=${COMMON_ENV.KEYCLOAK.vcauthn_idpHint}`}
              >
                Log in with Verifiable Credentials
              </a>
            </Button>
          </AuthorizationGuard>
        </div>
      );
    }
    const smallestDesktopWidth = 1280;
    return (
      <span>
        <MediaQuery minWidth={smallestDesktopWidth}>
          <AuthorizationWrapper>
            <Link to={route.MINES.route} className={this.setActiveLink(route.MINES.route)}>
              My Mines
            </Link>
          </AuthorizationWrapper>
          {/* Disabled until we implement this */}
          {/* <Link to={route.USERS.route} className="header-link">
            My Users
          </Link> */}
          <Dropdown overlay={dropdownMenuDesktop}>
            <Button className="header-dropdown-button">
              {this.props.userInfo.email}
              <CaretDownOutlined />
            </Button>
          </Dropdown>
        </MediaQuery>
        <MediaQuery maxWidth={smallestDesktopWidth - 1}>
          <Dropdown overlay={dropdownMenuMobile} placement="bottomRight">
            <Button id="dropdown-menu-mobile-trigger" className="header-dropdown-button">
              <img src={MENU} alt="Menu" />
            </Button>
          </Dropdown>
        </MediaQuery>
      </span>
    );
  }
}

const mapStateToProps = (state) => ({
  userInfo: getUserInfo(state),
  isAuthenticated: isAuthenticated(state),
});

HeaderDropdown.propTypes = propTypes;
HeaderDropdown.defaultProps = defaultProps;

export default withRouter(connect(mapStateToProps)(HeaderDropdown));
