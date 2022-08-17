import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { Tooltip, Dropdown, Menu, Button, Row, Col } from "antd";
import { DownOutlined, UserOutlined, MessageOutlined } from "@ant-design/icons";
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
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import SearchBar from "@/components/search/SearchBar";
import { LOGO, HAMBURGER, CLOSE, SUCCESS_CHECKMARK, YELLOW_HAZARD } from "@/constants/assets";
import NotificationDrawer from "@/components/navigation/NotificationDrawer";
import { detectProdEnvironment as IN_PROD } from "@common/utils/environmentUtils";

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
          <span className="padding-sm--right">Browse...</span>
          <DownOutlined />
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
      <AuthorizationWrapper permission={Permission.VIEW_ADMIN_ROUTE}>
        <Dropdown overlay={this.adminDropdown} placement="bottomLeft">
          <button id={this.ifActiveButton("admin")} type="button" className="menu__btn">
            <span className="padding-sm--right">Admin</span>
            <DownOutlined />
          </button>
        </Dropdown>
      </AuthorizationWrapper>
      <Dropdown overlay={this.userMenu} placement="bottomLeft">
        <button type="button" className="menu__btn" id={this.ifActiveButton("my-dashboard")}>
          <UserOutlined className="padding-sm--right icon-sm" />
          <span className="padding-sm--right">{this.props.userInfo.preferred_username}</span>
          <DownOutlined />
        </button>
      </Dropdown>
      <a
        href="https://fider.apps.silver.devops.gov.bc.ca/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Tooltip title="Feedback" placement="bottom">
          <Button type="link" className="menu__btn--link">
            <MessageOutlined className="icon-sm" />
          </Button>
        </Tooltip>
      </a>
      <AuthorizationWrapper permission={Permission.ADMIN} showToolTip={false}>
        <Dropdown
          overlay={this.unverifiedMinesMenu()}
          placement="bottomLeft"
          disabled={this.props.currentUserUnverifiedMines.length === 0}
        >
          <button type="button" className="menu__btn">
            <img
              alt="GoodMines"
              className="padding-sm--right icon-sm vertical-align-sm"
              src={SUCCESS_CHECKMARK}
              width="25"
            />
            <span className="padding-sm--right">{this.props.currentUserVerifiedMines.length}</span>
            {this.props.currentUserUnverifiedMines.length > 0 && (
              <img
                alt="BadMines"
                className="padding-sm--right icon-sm vertical-align-sm"
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
          <AuthorizationWrapper permission={Permission.EDIT_TEMPLATE_PERMIT_CONDITIONS}>
            <Row>
              <Col span={24}>
                <Link to={router.ADMIN_PERMIT_CONDITION_MANAGEMENT.dynamicRoute("sand-and-gravel")}>
                  <Button
                    id={this.ifActiveButton(router.ADMIN_PERMIT_CONDITION_MANAGEMENT.route)}
                    className="menu--hamburger__btn--link"
                  >
                    Permit Condition Management
                  </Button>
                </Link>
              </Col>
            </Row>
          </AuthorizationWrapper>
          <AuthorizationWrapper permission={Permission.ADMINISTRATIVE_USERS}>
            <Row>
              <Col span={24}>
                <Link to={router.ADMIN_CONTACT_MANAGEMENT.dynamicRoute("Person")}>
                  <Button
                    id={this.ifActiveButton(router.ADMIN_CONTACT_MANAGEMENT.route)}
                    className="menu--hamburger__btn--link"
                  >
                    Contact Management
                  </Button>
                </Link>
              </Col>
            </Row>
          </AuthorizationWrapper>
          <AuthorizationWrapper permission={Permission.EDIT_EMLI_CONTACTS}>
            <Row>
              <Col span={24}>
                <Link to={router.ADMIN_EMLI_CONTACT_MANAGEMENT.route}>
                  <Button
                    id={this.ifActiveButton(router.ADMIN_EMLI_CONTACT_MANAGEMENT.route)}
                    className="menu--hamburger__btn--link"
                  >
                    MineSpace EMLI Contacts
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
                  Variances
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
                  Incidents
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
                  Reports
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
                  Notices of Work
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
                href="https://fider.apps.silver.devops.gov.bc.ca/"
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
          <button type="button">Reporting Dashboard</button>
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
          <button type="button">Variances</button>
        </Link>
      </Menu.Item>
      <Menu.Item key="browse-incidents" className="navbar-dropdown-menu-item">
        <Link to={router.INCIDENTS_DASHBOARD.route}>
          <button type="button">Incidents</button>
        </Link>
      </Menu.Item>
      <Menu.Item key="browse-reports" className="navbar-dropdown-menu-item">
        <Link to={router.REPORTS_DASHBOARD.route}>
          <button type="button">Reports</button>
        </Link>
      </Menu.Item>
      <Menu.Item key="browse-notices-of-work" className="navbar-dropdown-menu-item">
        <Link to={router.NOTICE_OF_WORK_APPLICATIONS.route}>
          <button type="button">Notices of Work</button>
        </Link>
      </Menu.Item>
    </Menu>
  );

  adminDropdown = () => (
    <Menu id="menu__dropdown" className="navbar-dropdown-menu">
      <AuthorizationWrapper permission={Permission.ADMIN}>
        <Menu.Item key="admin/dashboard" className="navbar-dropdown-menu-item">
          <Link to={router.ADMIN_DASHBOARD.route}>
            <button type="button">Core Administrator</button>
          </Link>
        </Menu.Item>
      </AuthorizationWrapper>
      <AuthorizationWrapper permission={Permission.EDIT_TEMPLATE_PERMIT_CONDITIONS}>
        <Menu.Item key="executive-dashboard" className="navbar-dropdown-menu-item">
          <Link to={router.ADMIN_PERMIT_CONDITION_MANAGEMENT.dynamicRoute("sand-and-gravel")}>
            <button type="button">Permit Condition Management</button>
          </Link>
        </Menu.Item>
      </AuthorizationWrapper>
      <AuthorizationWrapper permission={Permission.ADMINISTRATIVE_USERS}>
        <Menu.Item key="contact-management" className="navbar-dropdown-menu-item">
          <Link to={router.ADMIN_CONTACT_MANAGEMENT.dynamicRoute("Person")}>
            <button type="button">Contact Management</button>
          </Link>
        </Menu.Item>
      </AuthorizationWrapper>
      <AuthorizationWrapper permission={Permission.EDIT_EMLI_CONTACTS}>
        <Menu.Item key="executive-dashboard" className="navbar-dropdown-menu-item">
          <Link to={router.ADMIN_EMLI_CONTACT_MANAGEMENT.route}>
            <button type="button">MineSpace EMLI Contacts</button>
          </Link>
        </Menu.Item>
      </AuthorizationWrapper>
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
            {!IN_PROD() && <NotificationDrawer />}
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
