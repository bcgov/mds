import React, { Component } from "react";
import { Icon, Dropdown, Menu, Button } from "antd";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import MediaQuery from "react-responsive";
import { includes } from "lodash";
import { getUserInfo } from "@/selectors/authenticationSelectors";
import * as router from "@/constants/routes";
import * as Strings from "@/constants/strings";
import * as Permission from "@/constants/permissions";
import { LOGO, ADMIN, MINE, HAMBURGER } from "@/constants/assets";
import Logout from "../authentication/Logout";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";

/**
 * @class NavBar - Simple fixed navbar at the top of the screen with home button/username/logout
 */

const propTypes = {
  userInfo: PropTypes.shape({ preferred_username: PropTypes.string.isRequired }).isRequired,
  activeButton: PropTypes.string.isRequired,
};

export class NavBar extends Component {
  state = { isMenuOpen: false };

  menu = (
    <Menu>
      <Menu.Item key="0">
        <Logout />
      </Menu.Item>
    </Menu>
  );

  hambuegerMenu = (
    <Menu>
      <Menu.Item key="0">
        <Logout />
      </Menu.Item>
    </Menu>
  );

  renderFullNav = () => {
    return (
      <div className="menu">
        <Link
          to={router.MINE_HOME_PAGE.dynamicRoute({
            page: Strings.DEFAULT_PAGE,
            per_page: Strings.DEFAULT_PER_PAGE,
          })}
        >
          <img alt="Home" className="menu__img" src={LOGO} />
        </Link>
        <div className="inline-flex">
          <AuthorizationWrapper inDevelopment>
            {/* temporary style needed only because AuthWrapper only accepts one child element */}
            <span style={{ height: "100%" }}>
              <Link
                to={router.MINE_HOME_PAGE.dynamicRoute({
                  page: Strings.DEFAULT_PAGE,
                  per_page: Strings.DEFAULT_PER_PAGE,
                })}
              >
                <Button
                  id={
                    includes(this.props.activeButton, router.MINE_HOME_PAGE.route)
                      ? "active-mine-btn"
                      : ""
                  }
                  className="menu__btn--link"
                >
                  <img
                    alt="Mine"
                    className="padding-small--right"
                    style={{ verticalAlign: "-0.125em" }}
                    src={MINE}
                  />
                  Mines
                </Button>
              </Link>
              <Link
                to={router.CONTACT_HOME_PAGE.dynamicRoute({
                  page: Strings.DEFAULT_PAGE,
                  per_page: Strings.DEFAULT_PER_PAGE,
                })}
              >
                <Button
                  id={
                    includes(this.props.activeButton, router.CONTACT_HOME_PAGE.route)
                      ? "active-contact-btn"
                      : ""
                  }
                  className="menu__btn--link"
                >
                  <Icon type="team" className="icon-sm" />
                  Contacts
                </Button>
              </Link>
            </span>
          </AuthorizationWrapper>
          <AuthorizationWrapper permission={Permission.ADMIN}>
            <Link to={router.ADMIN_DASHBOARD.route}>
              <Button
                id={
                  includes(this.props.activeButton, router.ADMIN_DASHBOARD.route)
                    ? "active-admin-btn"
                    : ""
                }
                className="menu__btn--link"
              >
                <img alt="Admin" className="padding-small--right icon-sm" src={ADMIN} />
                Admin
              </Button>
            </Link>
          </AuthorizationWrapper>
          <Dropdown overlay={this.menu} placement="bottomLeft">
            <button type="button" className="menu__btn">
              <Icon className="padding-small--right icon-sm" type="user" />
              <span className="padding-small--right">{this.props.userInfo.preferred_username}</span>
              <Icon type="down" />
            </button>
          </Dropdown>
        </div>
      </div>
    );
  };

  renderHamburgerNav = () => {
    return (
      <div>
        <div className="menu">
          <Link
            to={router.MINE_HOME_PAGE.dynamicRoute({
              page: Strings.DEFAULT_PAGE,
              per_page: Strings.DEFAULT_PER_PAGE,
            })}
          >
            <img alt="Home" className="menu__img" src={LOGO} />
          </Link>
          <Button
            ghost
            type="button"
            className="menu__btn"
            style={{ padding: 0 }}
            onClick={this.props.toggleHamburgerMenu}
          >
            <img alt="menu" src={HAMBURGER} />
          </Button>
        </div>
        {this.props.isMenuOpen && (
          <div className="menu--hamburger">
            <AuthorizationWrapper inDevelopment>
              {/* temporary style needed only because AuthWrapper only accepts one child element */}
              <span>
                <Link
                  to={router.MINE_HOME_PAGE.dynamicRoute({
                    page: Strings.DEFAULT_PAGE,
                    per_page: Strings.DEFAULT_PER_PAGE,
                  })}
                >
                  <Button
                    id={
                      includes(this.props.activeButton, router.MINE_HOME_PAGE.route)
                        ? "active-mine-btn"
                        : ""
                    }
                    className="menu__btn--link"
                  >
                    <img
                      alt="Mine"
                      className="padding-small--right"
                      style={{ verticalAlign: "-0.125em" }}
                      src={MINE}
                    />
                    Mines
                  </Button>
                </Link>
                <Link
                  to={router.CONTACT_HOME_PAGE.dynamicRoute({
                    page: Strings.DEFAULT_PAGE,
                    per_page: Strings.DEFAULT_PER_PAGE,
                  })}
                >
                  <Button
                    id={
                      includes(this.props.activeButton, router.CONTACT_HOME_PAGE.route)
                        ? "active-contact-btn"
                        : ""
                    }
                    className="menu__btn--link"
                  >
                    <Icon type="team" className="icon-sm" />
                    Contacts
                  </Button>
                </Link>
              </span>
            </AuthorizationWrapper>
            <AuthorizationWrapper permission={Permission.ADMIN}>
              <Link to={router.ADMIN_DASHBOARD.route}>
                <Button
                  id={
                    includes(this.props.activeButton, router.ADMIN_DASHBOARD.route)
                      ? "active-admin-btn"
                      : ""
                  }
                  className="menu__btn--link"
                >
                  <img alt="Admin" className="padding-small--right icon-sm" src={ADMIN} />
                  Admin
                </Button>
              </Link>
            </AuthorizationWrapper>
          </div>
        )}
      </div>
    );
  };

  render() {
    return (
      <div>
        <MediaQuery minWidth={701}>{this.renderFullNav()}</MediaQuery>
        <MediaQuery maxWidth={700}>{this.renderHamburgerNav()}</MediaQuery>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  userInfo: getUserInfo(state),
});

NavBar.propTypes = propTypes;

export default connect(mapStateToProps)(NavBar);
