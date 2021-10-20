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

export class PermitConditionsNavigation extends Component {
  ifActiveButton = (route) => (includes(this.props.activeButton, route) ? "active-menu-btn" : "");

  render() {
    return (
      <Menu mode="horizontal" selectedKeys={this.props.openSubMenuKey}>
        <Menu.SubMenu
          id={this.ifActiveButton("permit-condition-management")}
          title={
            <span>
              Permit Conditions
              <DownOutlined className="padding-sm--left" />
            </span>
          }
        >
          <Menu className="sub-menu">
            <Menu.Item key="sand-and-gravel">
              <Link to={routes.ADMIN_PERMIT_CONDITION_MANAGEMENT.dynamicRoute("sand-and-gravel")}>
                Sand & Gravel
              </Link>
            </Menu.Item>
            <Menu.Item key="exploration">
              <Link to={routes.ADMIN_PERMIT_CONDITION_MANAGEMENT.dynamicRoute("exploration")}>
                Exploration (MX/CX)
              </Link>
            </Menu.Item>
            <Menu.Item key="quarry">
              <Link to={routes.ADMIN_PERMIT_CONDITION_MANAGEMENT.dynamicRoute("quarry")}>
                Quarry
              </Link>
            </Menu.Item>
            <Menu.Item key="placer">
              <Link to={routes.ADMIN_PERMIT_CONDITION_MANAGEMENT.dynamicRoute("placer")}>
                Placer
              </Link>
            </Menu.Item>
          </Menu>
        </Menu.SubMenu>
      </Menu>
    );
  }
}

PermitConditionsNavigation.propTypes = propTypes;

export default PermitConditionsNavigation;
