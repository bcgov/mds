import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Menu } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { includes } from "lodash";
import * as routes from "@/constants/routes";

const propTypes = {
  activeButton: PropTypes.string.isRequired,
  openSubMenuKey: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export class AdminNavigation extends Component {
  ifActiveButton = (route) => (includes(this.props.activeButton, route) ? "active-menu-btn" : "");

  render() {
    return (
      <Menu mode="horizontal" selectedKeys={this.props.openSubMenuKey}>
        <Menu.SubMenu
          id={this.ifActiveButton("mine-verification")}
          title={
            <span>
              Mine Verification
              <DownOutlined className="padding-sm--left" />
            </span>
          }
        >
          <Menu className="sub-menu">
            <Menu.Item key="verified">
              <Link to={routes.ADMIN_VERIFIED_MINES.dynamicRoute("verified")}>Verified Mines</Link>
            </Menu.Item>
            <Menu.Item key="unverified">
              <Link to={routes.ADMIN_VERIFIED_MINES.dynamicRoute("unverified")}>
                UnVerified Mines
              </Link>
            </Menu.Item>
          </Menu>
        </Menu.SubMenu>
        <Menu.SubMenu
          id={this.ifActiveButton("manage-minespace")}
          title={
            <span>
              MineSpace Management
              <DownOutlined className="padding-sm--left" />
            </span>
          }
        >
          <Menu className="sub-menu">
            <Menu.Item key="users">
              <Link to={routes.ADMIN_MANAGE_MINESPACE_USERS.route}>Users</Link>
            </Menu.Item>
          </Menu>
        </Menu.SubMenu>
      </Menu>
    );
  }
}

AdminNavigation.propTypes = propTypes;
export default AdminNavigation;
