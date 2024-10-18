import React, { FC, useEffect } from "react";
import { Tooltip, Dropdown, Button, Row, Col, MenuProps } from "antd";
import { DownOutlined, UserOutlined, MessageOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import MediaQuery from "react-responsive";
import { includes } from "lodash";
import { getUserInfo } from "@mds/common/redux/selectors/authenticationSelectors";
import { fetchMineVerifiedStatuses } from "@mds/common/redux/actionCreators/mineActionCreator";
import {
  getCurrentUserVerifiedMines,
  getCurrentUserUnverifiedMines,
} from "@mds/common/redux/reducers/mineReducer";
import * as Strings from "@mds/common/constants/strings";
import * as router from "@/constants/routes";
import * as Permission from "@/constants/permissions";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import SearchBar from "@/components/search/SearchBar";
import { LOGO, HAMBURGER, CLOSE, SUCCESS_CHECKMARK, YELLOW_HAZARD } from "@/constants/assets";
import NotificationDrawer from "@/components/navigation/NotificationDrawer";
import HelpGuide from "@mds/common/components/help/HelpGuide";

/**
 * @React.FC NavBar - fixed and responsive navigation
 */

interface NavBarProps {
  activeButton: string;
  isMenuOpen: boolean;
  toggleHamburgerMenu: () => void;
}

export const NavBar: FC<NavBarProps> = ({ activeButton, isMenuOpen, toggleHamburgerMenu }) => {
  const dispatch = useDispatch();
  const userInfo = useSelector(getUserInfo);
  const currentUserVerifiedMines = useSelector(getCurrentUserVerifiedMines) ?? [];
  const currentUserUnverifiedMines = useSelector(getCurrentUserUnverifiedMines) ?? [];

  useEffect(() => {
    dispatch(fetchMineVerifiedStatuses(`idir\\${userInfo.preferred_username}`));
  }, []);

  const ifActiveButton = (route: string) =>
    includes(activeButton, route) ? "active-menu-btn" : "";
  const dropdownMenuProps = { className: "navbar-dropdown-menu", id: "menu__dropdown" };
  const fullNavMinWidth = 1080;

  const unverifiedMinesMenuItems: MenuProps["items"] = [
    {
      key: "reverify-mines",
      label: "Please re-verify the following mines:",
      children: currentUserUnverifiedMines.map((mineVerificationStatus) => ({
        key: mineVerificationStatus.mine_guid,
        label: (
          <Link to={router.MINE_DASHBOARD.dynamicRoute(mineVerificationStatus.mine_guid)}>
            {mineVerificationStatus.mine_name}
          </Link>
        ),
      })),
    },
  ];

  const renderMenuItemLabel = (item: { label: string; route: string; permission?: string }) => {
    const content = (
      <Link to={item.route}>
        <button type="button">{item.label}</button>
      </Link>
    );
    return item.permission ? (
      <AuthorizationWrapper permission={item.permission}>{content}</AuthorizationWrapper>
    ) : (
      content
    );
  };

  const renderFullNavMenuItem = (item: {
    key: string;
    label: string;
    route: string;
    link?: string;
    permission?: string;
  }) => {
    return {
      key: item.key,
      className: "navbar-dropdown-menu-item",
      label: renderMenuItemLabel(item),
    };
  };

  const renderHamburgerNavItem = (item: {
    label: string;
    route: string;
    link?: string;
    permission?: string;
  }) => {
    const content = (
      <Row key={item.label}>
        <Col span={24}>
          <Link to={item.link ?? item.route}>
            <Button id={ifActiveButton(item.route)} className="menu--hamburger__btn--link">
              {item.label}
            </Button>
          </Link>
        </Col>
      </Row>
    );
    return item.permission ? (
      <AuthorizationWrapper permission={item.permission}>{content}</AuthorizationWrapper>
    ) : (
      content
    );
  };

  const reportingDropdownItems: MenuProps["items"] = [
    {
      key: "dashboard",
      label: "Reporting Dashboard",
      route: router.REPORTING_DASHBOARD.route,
    },
    {
      key: "executive-dashboard",
      label: "Executive Dashboard",
      route: router.EXECUTIVE_REPORTING_DASHBOARD.route,
      permission: Permission.EXECUTIVE,
    },
    {
      key: "browse-variances",
      label: "Variances",
      route: router.VARIANCE_DASHBOARD.route,
    },
    {
      key: "browse-incidents",
      label: "Incidents",
      route: router.INCIDENTS_DASHBOARD.route,
    },
    {
      key: "browse-reports",
      label: "Reports",
      route: router.REPORTS_DASHBOARD.route,
    },
    {
      key: "browse-notices-of-work",
      label: "Notices of Work",
      route: router.NOTICE_OF_WORK_APPLICATIONS.route,
    },
    {
      key: "browse-major-projects",
      label: "Major Projects",
      route: router.MAJOR_PROJECTS_DASHBOARD.route,
    },
  ].map((item) => renderFullNavMenuItem(item));

  const adminDropdownItems: MenuProps["items"] = [
    {
      key: "admin/dashboard",
      label: "Core Administrator",
      route: router.ADMIN_DASHBOARD.route,
      permission: Permission.ADMIN,
    },
    {
      key: "executive-dashboard",
      label: "Permit Condition Management",
      route: router.ADMIN_PERMIT_CONDITION_MANAGEMENT.dynamicRoute("sand-and-gravel"),
      permission: Permission.EDIT_TEMPLATE_PERMIT_CONDITIONS,
    },
    {
      key: "contact-management",
      label: "Contact Management",
      route: router.ADMIN_CONTACT_MANAGEMENT.dynamicRoute("Person"),
      permission: Permission.ADMINISTRATIVE_USERS,
    },
    {
      key: "emli-contact-management",
      label: "MineSpace EMLI Contacts",
      route: router.ADMIN_EMLI_CONTACT_MANAGEMENT.route,
      permission: Permission.EDIT_EMLI_CONTACTS,
    },
  ].map(renderFullNavMenuItem);

  const userMenuItems: MenuProps["items"] = [
    {
      key: "my-dashboard",
      label: "My Dashboard",
      route: router.CUSTOM_HOME_PAGE.route,
    },
    {
      key: "log-out",
      label: "Log Out",
      route: router.LOGOUT.route,
    },
  ].map(renderFullNavMenuItem);

  const renderFullNav = () => (
    <div>
      <Dropdown
        menu={{ items: reportingDropdownItems, ...dropdownMenuProps }}
        placement="bottomLeft"
      >
        <button id={ifActiveButton("reporting")} type="button" className="menu__btn">
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
        <Button
          id={ifActiveButton(router.MINE_HOME_PAGE.route)}
          className="menu__btn--link"
          data-cy="mines-button"
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
        <Button id={ifActiveButton(router.CONTACT_HOME_PAGE.route)} className="menu__btn--link">
          Contacts
        </Button>
      </Link>
      <AuthorizationWrapper permission={Permission.VIEW_ADMIN_ROUTE}>
        <Dropdown menu={{ items: adminDropdownItems, ...dropdownMenuProps }} placement="bottomLeft">
          <button id={ifActiveButton("admin")} type="button" className="menu__btn">
            <span className="padding-sm--right">Admin</span>
            <DownOutlined />
          </button>
        </Dropdown>
      </AuthorizationWrapper>
      <Dropdown menu={{ items: userMenuItems, ...dropdownMenuProps }} placement="bottomLeft">
        <button type="button" className="menu__btn" id={ifActiveButton("my-dashboard")}>
          <UserOutlined className="padding-sm--right icon-sm" />
          <span className="padding-sm--right">{userInfo.preferred_username}</span>
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
          menu={{ items: unverifiedMinesMenuItems }}
          placement="bottomLeft"
          disabled={currentUserUnverifiedMines.length === 0}
        >
          <button type="button" className="menu__btn">
            <img
              alt="GoodMines"
              className="padding-sm--right icon-sm vertical-align-sm"
              src={SUCCESS_CHECKMARK}
              width="25"
            />
            <span className="padding-sm--right">{currentUserVerifiedMines.length}</span>
            {currentUserUnverifiedMines.length > 0 && (
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

  const hamburgerNavItems = [
    {
      label: "Mines",
      route: router.MINE_HOME_PAGE.route,
      link: router.MINE_HOME_PAGE.dynamicRoute({
        page: Strings.DEFAULT_PAGE,
        per_page: Strings.DEFAULT_PER_PAGE,
      }),
    },
    {
      label: "Contacts",
      route: router.CONTACT_HOME_PAGE.route,
      link: router.CONTACT_HOME_PAGE.dynamicRoute({
        page: Strings.DEFAULT_PAGE,
        per_page: Strings.DEFAULT_PER_PAGE,
      }),
    },
    {
      label: "Admin",
      route: router.ADMIN_DASHBOARD.route,
      permission: Permission.ADMIN,
    },
    {
      label: "Permit Condition Management",
      route: router.ADMIN_PERMIT_CONDITION_MANAGEMENT.route,
      link: router.ADMIN_PERMIT_CONDITION_MANAGEMENT.dynamicRoute("sand-and-gravel"),
      permission: Permission.EDIT_TEMPLATE_PERMIT_CONDITIONS,
    },
    {
      label: "Contact Management",
      route: router.ADMIN_CONTACT_MANAGEMENT.route,
      link: router.ADMIN_CONTACT_MANAGEMENT.dynamicRoute("Person"),
      permission: Permission.ADMINISTRATIVE_USERS,
    },
    {
      label: "MineSpace EMLI Contacts",
      route: router.ADMIN_EMLI_CONTACT_MANAGEMENT.route,
      permission: Permission.EDIT_EMLI_CONTACTS,
    },
    {
      label: "Reporting Dashboard",
      route: router.REPORTING_DASHBOARD.route,
    },
    {
      label: "Executive Dashboard",
      route: router.EXECUTIVE_REPORTING_DASHBOARD.route,
      permission: Permission.EXECUTIVE,
    },
    {
      label: "Variances",
      route: router.VARIANCE_DASHBOARD.route,
    },
    {
      label: "Incidents",
      route: router.INCIDENTS_DASHBOARD.route,
    },
    {
      label: "Reports",
      route: router.REPORTS_DASHBOARD.route,
    },
    {
      label: "Notices of Work",
      route: router.NOTICE_OF_WORK_APPLICATIONS.route,
    },
    {
      label: "Major Projects",
      route: router.MAJOR_PROJECTS_DASHBOARD.route,
    },
    {
      label: "My Dashboard",
      route: router.CUSTOM_HOME_PAGE.route,
    },
  ].map((item) => renderHamburgerNavItem(item));

  const renderHamburgerNav = () => (
    <div>
      {isMenuOpen && (
        <div className="menu--hamburger">
          {hamburgerNavItems}
          <Row>
            <Col span={24}>
              <a
                href="https://fider.apps.silver.devops.gov.bc.ca/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button id="feedback-btn" className="menu--hamburger__btn--link">
                  Feedback
                </Button>
              </a>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Link to={router.LOGOUT.route}>
                <Button id="logout-btn" className="menu--hamburger__btn--link">
                  Log Out
                </Button>
              </Link>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <p className="menu--hamburger--footer">Signed in as: {userInfo.preferred_username}</p>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div className="menu">
        <Row id="menu--image--search">
          <Link to={router.HOME_PAGE.route}>
            <img alt="Home" className="menu__img" src={LOGO} />
          </Link>
          <div className="menu--search">
            <SearchBar iconPlacement="prefix" placeholderText="Search Core..." showFocusButton />
          </div>
        </Row>
        <div className="inline-flex" id="menu--navbar-items">
          <MediaQuery maxWidth={fullNavMinWidth - 1}>
            <Button
              ghost
              className="menu__btn"
              style={{ padding: 0 }}
              onClick={toggleHamburgerMenu}
            >
              <img alt="menu" src={!isMenuOpen ? HAMBURGER : CLOSE} className="img-lg" />
            </Button>
          </MediaQuery>
          <MediaQuery minWidth={fullNavMinWidth}>{renderFullNav()}</MediaQuery>
          <NotificationDrawer />
          <HelpGuide />
        </div>
      </div>
      <MediaQuery maxWidth={fullNavMinWidth - 1}>{renderHamburgerNav()}</MediaQuery>
    </div>
  );
};

export default NavBar;
