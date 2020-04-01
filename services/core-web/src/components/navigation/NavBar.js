import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { Tooltip, Icon, Dropdown, Menu, Button, Row, Col } from "antd";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import MediaQuery from "react-responsive";
import { includes } from "lodash";
import { getUserInfo } from "@common/selectors/authenticationSelectors";
import { fetchMineVerifiedStatuses } from "@common/actionCreators/mineActionCreator";
import {
  getCurrentUserVerifiedMines,
  getCurrentUserUnverifiedMines,
} from "@common/reducers/mineReducer";
import * as Strings from "@common/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import * as router from "@/constants/routes";
import * as Permission from "@/constants/permissions";
import SearchBar from "@/components/search/SearchBar";
import { LOGO, HAMBURGER, CLOSE, SUCCESS_CHECKMARK, YELLOW_HAZARD } from "@/constants/assets";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";

/**
 * @class NavBar - fixed and responsive navigation
 */

const propTypes = {
  userInfo: PropTypes.shape({ preferred_username: PropTypes.string.isRequired }).isRequired,
  activeButton: PropTypes.string.isRequired,
  isMenuOpen: PropTypes.bool.isRequired,
  toggleHamburgerMenu: PropTypes.func.isRequired,
  fetchMineVerifiedStatuses: PropTypes.func.isRequired,
  currentUserVerifiedMines: PropTypes.arrayOf(CustomPropTypes.mineVerificationStatus),
  currentUserUnverifiedMines: PropTypes.arrayOf(CustomPropTypes.mineVerificationStatus),
};

const defaultProps = {
  currentUserVerifiedMines: [],
  currentUserUnverifiedMines: [],
};

export class NavBar extends Component {
  componentDidMount() {
    this.props.fetchMineVerifiedStatuses(`idir\\${this.props.userInfo.preferred_username}`);
  }

  ifActiveButton = (route) => (includes(this.props.activeButton, route) ? "active-menu-btn" : "");

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

  renderFullNav = () => (
    <div>
      <Dropdown overlay={this.reportingDropdown} placement="bottomLeft">
        <button id={this.ifActiveButton("reporting")} type="button" className="menu__btn">
          <span className="padding-small--right">Provincial Reporting</span>
          <Icon type="down" />
        </button>
      </Dropdown>
      <Link
        to={router.MINE_HOME_PAGE.dynamicRoute({
          page: Strings.DEFAULT_PAGE,
          per_page: Strings.DEFAULT_PER_PAGE,
        })}
      >
        <Button id={this.ifActiveButton(router.MINE_HOME_PAGE.route)} className="menu__btn--link">
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
          id={this.ifActiveButton(router.CONTACT_HOME_PAGE.route)}
          className="menu__btn--link"
        >
          Contacts
        </Button>
      </Link>
      <AuthorizationWrapper permission={Permission.ADMIN}>
        <Link to={router.ADMIN_DASHBOARD.route}>
          <Button
            id={this.ifActiveButton(router.ADMIN_DASHBOARD.route)}
            className="menu__btn--link"
          >
            Admin
          </Button>
        </Link>
      </AuthorizationWrapper>
      <Dropdown overlay={this.userMenu} placement="bottomLeft">
        <button type="button" className="menu__btn" id={this.ifActiveButton("my-dashboard")}>
          <Icon className="padding-small--right icon-sm" type="user" />
          <span className="padding-small--right">{this.props.userInfo.preferred_username}</span>
          <Icon type="down" />
        </button>
      </Dropdown>
      <a href="https://mdsfider.pathfinder.gov.bc.ca/" target="_blank" rel="noopener noreferrer">
        <Tooltip title="Feedback" placement="bottom">
          <Button type="link" className="menu__btn--link">
            <Icon type="message" className="icon-sm" />
          </Button>
        </Tooltip>
      </a>
      <AuthorizationWrapper permission={Permission.ADMIN}>
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
          <Row>
            <Col span={24}>
              <Link
                to={router.MINE_HOME_PAGE.dynamicRoute({
                  page: Strings.DEFAULT_PAGE,
                  per_page: Strings.DEFAULT_PER_PAGE,
                })}
              >
                <Button
                  id={this.ifActiveButton(router.MINE_HOME_PAGE.route)}
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
                  id={this.ifActiveButton(router.CONTACT_HOME_PAGE.route)}
                  className="menu--hamburger__btn--link"
                >
                  Contacts
                </Button>
              </Link>
            </Col>
          </Row>
          <AuthorizationWrapper permission={Permission.ADMIN}>
            <Row>
              <Col span={24}>
                <Link to={router.ADMIN_DASHBOARD.route}>
                  <Button
                    id={this.ifActiveButton(router.ADMIN_DASHBOARD.route)}
                    className="menu--hamburger__btn--link"
                  >
                    Admin
                  </Button>
                </Link>
              </Col>
            </Row>
          </AuthorizationWrapper>
          <Row>
            <Col span={24}>
              <Link to={router.REPORTING_DASHBOARD.route}>
                <Button
                  id={this.ifActiveButton(router.REPORTING_DASHBOARD.route)}
                  className="menu--hamburger__btn--link"
                >
                  Reporting Dashboard
                </Button>
              </Link>
            </Col>
          </Row>
          <AuthorizationWrapper permission={Permission.EXECUTIVE}>
            <Row>
              <Col span={24}>
                <Link to={router.EXECUTIVE_REPORTING_DASHBOARD.route}>
                  <Button
                    id={this.ifActiveButton(router.EXECUTIVE_REPORTING_DASHBOARD.route)}
                    className="menu--hamburger__btn--link"
                  >
                    Executive Dashboard
                  </Button>
                </Link>
              </Col>
            </Row>
          </AuthorizationWrapper>
          <Row>
            <Col span={24}>
              <Link to={router.VARIANCE_DASHBOARD.route}>
                <Button
                  id={this.ifActiveButton(router.VARIANCE_DASHBOARD.route)}
                  className="menu--hamburger__btn--link"
                >
                  Browse Variances
                </Button>
              </Link>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Link to={router.INCIDENTS_DASHBOARD.route}>
                <Button
                  id={this.ifActiveButton(router.INCIDENTS_DASHBOARD.route)}
                  className="menu--hamburger__btn--link"
                >
                  Browse Incidents
                </Button>
              </Link>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Link to={router.REPORTS_DASHBOARD.route}>
                <Button
                  id={this.ifActiveButton(router.REPORTS_DASHBOARD.route)}
                  className="menu--hamburger__btn--link"
                >
                  Browse Reports
                </Button>
              </Link>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Link to={router.NOTICE_OF_WORK_APPLICATIONS.route}>
                <Button
                  id={this.ifActiveButton(router.NOTICE_OF_WORK_APPLICATIONS.route)}
                  className="menu--hamburger__btn--link"
                >
                  Browse Notices of Work
                </Button>
              </Link>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Link to={router.CUSTOM_HOME_PAGE.route}>
                <Button
                  id={
                    includes(this.props.activeButton, router.CUSTOM_HOME_PAGE.route)
                      ? "active-menu-btn"
                      : ""
                  }
                  className="menu--hamburger__btn--link"
                >
                  My Dashboard
                </Button>
              </Link>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <a
                href="https://mdsfider.pathfinder.gov.bc.ca/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button id="feedback-btn" type="button" className="menu--hamburger__btn--link">
                  Feedback
                </Button>
              </a>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Link to={router.LOGOUT.route}>
                <Button id="logout-btn" type="button" className="menu--hamburger__btn--link">
                  Log Out
                </Button>
              </Link>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <p className="menu--hamburger--footer">
                Signed in as: {this.props.userInfo.preferred_username}
              </p>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );

  userMenu = () => (
    <Menu id="menu__dropdown" className="navbar-dropdown-menu">
      <Menu.Item key="my-dashboard" className="navbar-dropdown-menu-item">
        <Link to={router.CUSTOM_HOME_PAGE.route}>
          <button type="button">My Dashboard</button>
        </Link>
      </Menu.Item>
      <Menu.Item key="log-out" className="navbar-dropdown-menu-item">
        <Link to={router.LOGOUT.route}>
          <button type="button">Log Out</button>
        </Link>
      </Menu.Item>
    </Menu>
  );

  reportingDropdown = () => (
    <Menu id="menu__dropdown" className="navbar-dropdown-menu">
      <Menu.Item key="dashboard" className="navbar-dropdown-menu-item">
        <Link to={router.REPORTING_DASHBOARD.route}>
          <button type="button">Dashboard</button>
        </Link>
      </Menu.Item>
      <AuthorizationWrapper permission={Permission.EXECUTIVE}>
        <Menu.Item key="executive-dashboard" className="navbar-dropdown-menu-item">
          <Link to={router.EXECUTIVE_REPORTING_DASHBOARD.route}>
            <button type="button">Executive Dashboard</button>
          </Link>
        </Menu.Item>
      </AuthorizationWrapper>
      <Menu.Item key="browse-variances" className="navbar-dropdown-menu-item">
        <Link to={router.VARIANCE_DASHBOARD.route}>
          <button type="button">Browse Variances</button>
        </Link>
      </Menu.Item>
      <Menu.Item key="browse-incidents" className="navbar-dropdown-menu-item">
        <Link to={router.INCIDENTS_DASHBOARD.route}>
          <button type="button">Browse Incidents</button>
        </Link>
      </Menu.Item>
      <Menu.Item key="browse-reports" className="navbar-dropdown-menu-item">
        <Link to={router.REPORTS_DASHBOARD.route}>
          <button type="button">Browse Reports</button>
        </Link>
      </Menu.Item>
      <Menu.Item key="browse-notices-of-work" className="navbar-dropdown-menu-item">
        <Link to={router.NOTICE_OF_WORK_APPLICATIONS.route}>
          <button type="button">Browse Notices of Work</button>
        </Link>
      </Menu.Item>
    </Menu>
  );

  render() {
    const fullNavMinWidth = 1080;
    return (
      <div>
        <div className="menu">
          <Link to={router.HOME_PAGE.route}>
            <img alt="Home" className="menu__img" src={LOGO} />
          </Link>
          <div className="inline-flex">
            <div className="menu--search">
              <SearchBar containerId="navBar" />
            </div>
            <MediaQuery maxWidth={fullNavMinWidth - 1}>
              <Button
                ghost
                type="button"
                className="menu__btn"
                style={{ padding: 0 }}
                onClick={this.props.toggleHamburgerMenu}
              >
                <img
                  alt="menu"
                  src={!this.props.isMenuOpen ? HAMBURGER : CLOSE}
                  className="img-lg"
                />
              </Button>
            </MediaQuery>
            <MediaQuery minWidth={fullNavMinWidth}>{this.renderFullNav()}</MediaQuery>
          </div>
        </div>
        <MediaQuery maxWidth={fullNavMinWidth - 1}>{this.renderHamburgerNav()}</MediaQuery>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  userInfo: getUserInfo(state),
  currentUserVerifiedMines: getCurrentUserVerifiedMines(state),
  currentUserUnverifiedMines: getCurrentUserUnverifiedMines(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineVerifiedStatuses,
    },
    dispatch
  );

NavBar.propTypes = propTypes;
NavBar.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(NavBar);
