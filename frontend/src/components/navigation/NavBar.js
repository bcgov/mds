import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { Icon, Dropdown, Menu, Button, Row, Col } from "antd";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import MediaQuery from "react-responsive";
import { includes } from "lodash";
import { getUserInfo, getKeycloak } from "@/selectors/authenticationSelectors";
import { logoutUser } from "@/actions/authenticationActions";
import * as router from "@/constants/routes";
import * as Strings from "@/constants/strings";
import * as Styles from "@/constants/styles";
import * as Permission from "@/constants/permissions";
import {
  LOGO,
  ADMIN,
  MINE,
  HAMBURGER,
  LOGOUT_WHITE,
  LOGOUT,
  TEAM,
  CLOSE,
} from "@/constants/assets";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";

/**
 * @class NavBar - fixed and responsive navigation
 */

const propTypes = {
  userInfo: PropTypes.shape({ preferred_username: PropTypes.string.isRequired }).isRequired,
  activeButton: PropTypes.string.isRequired,
  isMenuOpen: PropTypes.bool.isRequired,
  logoutUser: PropTypes.func.isRequired,
  toggleHamburgerMenu: PropTypes.func.isRequired,
  keycloak: { logout: PropTypes.func.isRequired }.isRequired,
};

export class NavBar extends Component {
  menu = (
    <Menu>
      <Menu.Item key="0">
        <button type="button" onClick={this.handleLogout}>
          <img alt="Logout" src={LOGOUT} className="menu__img" />
          Logout
        </button>
      </Menu.Item>
    </Menu>
  );

  handleLogout = () => {
    this.props.keycloak.logout();
    localStorage.removeItem("jwt");
    this.props.logoutUser();
  };

  renderFullNav = () => (
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
              <img alt="Mine" className="padding-small--right vertical-align-sm" src={MINE} />
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
              <img
                alt="team"
                className="padding-small--right icon-sm vertical-align-sm"
                src={TEAM}
              />
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
            <img
              alt="Admin"
              className="padding-small--right icon-sm vertical-align-sm"
              src={ADMIN}
            />
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
  );

  renderHamburgerNav = () => (
    <div>
      {this.props.isMenuOpen && (
        <div className="menu--hamburger">
          <AuthorizationWrapper inDevelopment>
            <span>
              <Row>
                <Col span={24}>
                  <Link
                    to={router.MINE_HOME_PAGE.dynamicRoute({
                      page: Strings.DEFAULT_PAGE,
                      per_page: Strings.DEFAULT_PER_PAGE,
                    })}
                  >
                    <Button
                      id={
                        includes(this.props.activeButton, router.MINE_HOME_PAGE.route)
                          ? "active-mine-btn--mobile"
                          : ""
                      }
                      className="menu--hamburger__btn--link"
                    >
                      <img alt="Mine" className="img-lg padding-large--right" src={MINE} />
                      Mines
                    </Button>
                  </Link>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Link
                    to={router.CONTACT_HOME_PAGE.dynamicRoute({
                      page: Strings.DEFAULT_PAGE,
                      per_page: Strings.DEFAULT_PER_PAGE,
                    })}
                  >
                    <Button
                      id={
                        includes(this.props.activeButton, router.CONTACT_HOME_PAGE.route)
                          ? "active-contact-btn--mobile"
                          : ""
                      }
                      className="menu--hamburger__btn--link"
                    >
                      <img alt="team" src={TEAM} className="img-lg padding-large--right" />
                      Contacts
                    </Button>
                  </Link>
                </Col>
              </Row>
            </span>
          </AuthorizationWrapper>
          <AuthorizationWrapper permission={Permission.ADMIN}>
            <Row>
              <Col span={24}>
                <Link to={router.ADMIN_DASHBOARD.route}>
                  <Button
                    id={
                      includes(this.props.activeButton, router.ADMIN_DASHBOARD.route)
                        ? "active-admin-btn--mobile"
                        : ""
                    }
                    className="menu--hamburger__btn--link"
                  >
                    <img alt="Admin" src={ADMIN} className="img-lg padding-large--right" />
                    Admin
                  </Button>
                </Link>
              </Col>
            </Row>
          </AuthorizationWrapper>
          <Row>
            <Col span={24}>
              <button
                type="button"
                onClick={this.handleLogout}
                className="menu--hamburger__btn--link"
              >
                <img alt="Logout" src={LOGOUT_WHITE} className="img-lg padding-large--right" />
                Logout
              </button>
            </Col>
          </Row>
          <div className="menu--hamburger--footer">
            <p style={{ color: Styles.COLOR.mediumGrey }}>
              Signed in as: {this.props.userInfo.preferred_username}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  render() {
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
          <MediaQuery maxWidth={768}>
            <Button
              ghost
              type="button"
              className="menu__btn"
              style={{ padding: 0 }}
              onClick={this.props.toggleHamburgerMenu}
            >
              <img alt="menu" src={!this.props.isMenuOpen ? HAMBURGER : CLOSE} className="img-lg" />
            </Button>
          </MediaQuery>
          <MediaQuery minWidth={769}>{this.renderFullNav()}</MediaQuery>
        </div>
        <MediaQuery maxWidth={768}>{this.renderHamburgerNav()}</MediaQuery>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  userInfo: getUserInfo(state),
  keycloak: getKeycloak(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      logoutUser,
    },
    dispatch
  );

NavBar.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NavBar);
