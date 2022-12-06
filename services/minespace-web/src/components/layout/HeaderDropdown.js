import React, { Component } from "react";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import { CaretDownOutlined } from "@ant-design/icons";
import { Menu, Dropdown, Button, Divider } from "antd";
import MediaQuery from "react-responsive";
import PropTypes from "prop-types";
import * as COMMON_ENV from "@mds/common";
import * as route from "@/constants/routes";
import * as MINESPACE_ENV from "@/constants/environment";
import { signOutFromSiteMinder } from "@/utils/authenticationHelpers";
import { isAuthenticated, getUserInfo } from "@/selectors/authenticationSelectors";
import { MENU } from "@/constants/assets";
import AuthorizationWrapper from "../common/wrappers/AuthorizationWrapper";
import LoginButton from "../common/LoginButton";

/**
 * @class HeaderDropdown.js contains various authentication states, and available links for authenticated users,
 * MediaQueries are used to switch the menu to a hamburger menu when viewed on mobile.
 */
const propTypes = {
  location: PropTypes.shape({ pathname: PropTypes.string }).isRequired,
  isAuthenticated: PropTypes.bool,
  userInfo: PropTypes.objectOf(PropTypes.string),
};

const defaultProps = {
  userInfo: {},
  isAuthenticated: false,
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
          <LoginButton className="login-btn" />
          <AuthorizationWrapper inTesting>
            {/* TODO BEFORE PROD: 
              1) Reach out to Wade Barnes (or, Emiliano Sune) and configure Production Keycloak Realm to use the vc-authn service as an Identity Provider
              2) Replicate IDP Mappers from TEST Keycloak (adding pres_req_conf_id to the client mapper as well)
              3) Production VC Issuer needs to be stood up, MDT team will be involved (BPA or other product)
              4) Add Proof Configuration for Production vc-authn installation (https://github.com/bcgov/a2a-trust-over-ip-configurations/tree/main/proof-configurations/minespace-access)
                  Use the same config as test/minespace-access-test, but with id = 'minespace-access-0.1', with ISSUER_DID that matches issuer from step 3. 
              5) Update Minespace to read 'pres_req_conf_id' from JWT and ensure it matches the 'vcauthn_pres_req_conf_id' environment variable
            */}
            <Button className="login-btn">
              <a
                href={`${COMMON_ENV.KEYCLOAK.loginURL}${MINESPACE_ENV.BCEID_LOGIN_REDIRECT_URI}&kc_idp_hint=${COMMON_ENV.KEYCLOAK.vcauthn_idpHint}`}
              >
                Log in with Verifiable Credentials
              </a>
            </Button>
          </AuthorizationWrapper>
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
  isAuthenticated: isAuthenticated(state) || false,
});

HeaderDropdown.propTypes = propTypes;
HeaderDropdown.defaultProps = defaultProps;

export default withRouter(connect(mapStateToProps)(HeaderDropdown));
