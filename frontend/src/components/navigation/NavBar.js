import React, { Component } from "react";
import { Icon, Dropdown, Menu } from "antd";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { getUserInfo } from "@/selectors/authenticationSelectors";
import * as router from "@/constants/routes";
import * as String from "@/constants/strings";
import { HOME, PROFILE } from "@/constants/assets";
import Logout from "../authentication/Logout";

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
    </Menu>
  );

  render() {
    return (
      <div className="menu">
        <Link
          to={router.MINE_DASHBOARD.dynamicRoute({
            page: String.DEFAULT_PAGE,
            per_page: String.DEFAULT_PER_PAGE,
          })}
        >
          <img alt="Home" className="menu__img" src={HOME} />
        </Link>
        <Dropdown overlay={this.menu} placement="bottomLeft">
          <button type="button" style={{ color: "#ffffff" }}>
            <img alt="Profile" className="menu__img" src={PROFILE} />
            {this.props.userInfo.preferred_username}
            <Icon type="down" />
          </button>
        </Dropdown>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  userInfo: getUserInfo(state),
});

NavBar.propTypes = propTypes;

export default connect(
  mapStateToProps,
  null
)(NavBar);
