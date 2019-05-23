import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { Icon, Dropdown, Menu, Button, Row, Col } from "antd";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import MediaQuery from "react-responsive";
import { includes } from "lodash";
import { getUserInfo, getKeycloak } from "@/selectors/authenticationSelectors";
import { logoutUser } from "@/actions/authenticationActions";
import * as router from "@/constants/routes";
import * as Strings from "@/constants/strings";
import * as Styles from "@/constants/styles";
import * as Permission from "@/constants/permissions";
import SearchBar from "@/components/search/SearchBar";
import { LOGO, HAMBURGER, CLOSE, SUCCESS_CHECKMARK, YELLOW_HAZARD } from "@/constants/assets";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import { fetchMineVerifiedStatuses } from "@/actionCreators/mineActionCreator";
import { getCurrentUserVerifiedMines, getCurrentUserUnverifiedMines } from "@/reducers/mineReducer";

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
  fetchMineVerifiedStatuses: PropTypes.func.isRequired,
  currentUserVerifiedMines: PropTypes.arrayOf(CustomPropTypes.mineVerificationStatus),
  currentUserUnverifiedMines: PropTypes.arrayOf(CustomPropTypes.mineVerificationStatus),
};

const defaultProps = {
  currentUserVerifiedMines: [],
  currentUserUnverifiedMines: [],
};

export class NavBar extends Component {
  menu = (
    <Menu id="menu__dropdown">
      <AuthorizationWrapper inTesting>
        <div className="custom-menu-item">
          <Link to={router.CUSTOM_HOME_PAGE.route}>
            <button type="button">My Dashboard</button>
          </Link>
        </div>
      </AuthorizationWrapper>
      <Menu.Item key="1">
        <button type="button" onClick={this.handleLogout}>
          Log Out
        </button>
      </Menu.Item>
    </Menu>
  );

  componentDidMount() {
    this.props.fetchMineVerifiedStatuses(`idir\\${this.props.userInfo.preferred_username}`);
  }

  unverifiedMinesMenu = () => (
    <Menu>
      <Menu.ItemGroup title="Please re-verify the following mines:" />
      {this.props.currentUserUnverifiedMines.map((mineVerificationStatus) => (
        <Menu.Item key={mineVerificationStatus.mine_guid}>
          <Link to={router.MINE_SUMMARY.dynamicRoute(mineVerificationStatus.mine_guid)}>
            {mineVerificationStatus.mine_name}
          </Link>
        </Menu.Item>
      ))}
    </Menu>
  );

  handleLogout = () => {
    this.props.keycloak.logout();
    localStorage.removeItem("jwt");
    this.props.logoutUser();
  };

  renderFullNav = () => (
    <div className="inline-flex">
      <Link
        to={router.MINE_HOME_PAGE.dynamicRoute({
          page: Strings.DEFAULT_PAGE,
          per_page: Strings.DEFAULT_PER_PAGE,
        })}
      >
        <Button
          id={
            includes(this.props.activeButton, router.MINE_HOME_PAGE.route) ? "active-mine-btn" : ""
          }
          className="menu__btn--link"
        >
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
          Contacts
        </Button>
      </Link>
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
      <AuthorizationWrapper inTesting>
        <Dropdown
          overlay={this.unverifiedMinesMenu()}
          placement="bottomLeft"
          disabled={this.props.currentUserUnverifiedMines.length === 0}
        >
          <button type="button" className="menu__btn">
            <img
              alt="GoodMines"
              className="padding-small--right icon-sm vertical-align-sm"
              src={SUCCESS_CHECKMARK}
              width="25"
            />
            <span className="padding-small--right">
              {this.props.currentUserVerifiedMines.length}
            </span>
            {this.props.currentUserUnverifiedMines.length > 0 && (
              <img
                alt="BadMines"
                className="padding-small--right icon-sm vertical-align-sm"
                src={YELLOW_HAZARD}
                width="25"
              />
            )}
          </button>
        </Dropdown>
      </AuthorizationWrapper>
    </div>
  );

  renderHamburgerNav = () => (
    <div>
      {this.props.isMenuOpen && (
        <div className="menu--hamburger">
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
                    Contacts
                  </Button>
                </Link>
              </Col>
            </Row>
          </span>
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
                    Admin
                  </Button>
                </Link>
              </Col>
            </Row>
          </AuthorizationWrapper>
          <AuthorizationWrapper inTesting>
            <Row>
              <Col span={24}>
                <Link to={router.CUSTOM_HOME_PAGE.route}>
                  <Button
                    id={
                      includes(this.props.activeButton, router.CUSTOM_HOME_PAGE.route)
                        ? "active-dashboard-btn--mobile"
                        : ""
                    }
                    className="menu--hamburger__btn--link"
                  >
                    My Dashboard
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
          <SearchBar />
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
  currentUserVerifiedMines: getCurrentUserVerifiedMines(state),
  currentUserUnverifiedMines: getCurrentUserUnverifiedMines(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      logoutUser,
      fetchMineVerifiedStatuses,
    },
    dispatch
  );

NavBar.propTypes = propTypes;
NavBar.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NavBar);
