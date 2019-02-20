import React, { Component } from "react";
import { Icon, Dropdown, Menu, Button } from "antd";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { getUserInfo } from "@/selectors/authenticationSelectors";
import * as router from "@/constants/routes";
import * as String from "@/constants/strings";
import * as Permission from "@/constants/permissions";
import { LOGO, ADMIN } from "@/constants/assets";
import Logout from "../authentication/Logout";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";

/**
 * @class NavBar - Simple fixed navbar at the top of the screen with home button/username/logout
 */

const propTypes = {
  userInfo: PropTypes.shape({ preferred_username: PropTypes.string.isRequired }).isRequired,
};

export class NavBar extends Component {
  menu = (
    <Menu>
      <Menu.Item key="0">
        <Logout />
      </Menu.Item>
      <AuthorizationWrapper permission={Permission.ADMIN}>
        <div className="custom-menu-item">
          <Link to={router.ADMIN_DASHBOARD.route}>
            <button type="button">
              <img alt="Admin" className="menu__img" src={ADMIN} />
              Admin
            </button>
          </Link>
        </div>
      </AuthorizationWrapper>
    </Menu>
  );

  render() {
    return (
      <div className="menu">
        <Link
          to={router.MINE_HOME_PAGE.dynamicRoute({
            page: String.DEFAULT_PAGE,
            per_page: String.DEFAULT_PER_PAGE,
          })}
        >
          <img alt="Home" className="menu__img" src={LOGO} />
        </Link>
        <div className="inline-flex">
          <Link
            to={router.MINE_HOME_PAGE.dynamicRoute({
              page: String.DEFAULT_PAGE,
              per_page: String.DEFAULT_PER_PAGE,
            })}
          >
            <Button
              id={this.props.activeButton === router.MINE_HOME_PAGE.route && "active-contact-btn"}
              className="menu__btn--link"
            >
              <Icon type="compass" /> Mines
            </Button>
          </Link>
          <Link to={router.CONTACT_HOME_PAGE.route}>
            <Button
              id={
                this.props.activeButton === router.CONTACT_HOME_PAGE.route && "active-contact-btn"
              }
              className="menu__btn--link"
            >
              <Icon type="team" /> Contacts
            </Button>
          </Link>
          <Dropdown overlay={this.menu} placement="bottomLeft">
            <button type="button" className="menu__btn">
              <Icon className="padding-right" type="user" />
              {/* <img alt="Profile" className="menu__img" src={PROFILE} /> */}
              <span className="padding-right"> {this.props.userInfo.preferred_username}</span>
              <Icon className="padding-right" type="down" />
            </button>
          </Dropdown>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  userInfo: getUserInfo(state),
});

NavBar.propTypes = propTypes;

export default connect(mapStateToProps)(NavBar);
