import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { Menu } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { includes } from "lodash";
import * as Permission from "@/constants/permissions";
import { getUserAccessData } from "@common/selectors/authenticationSelectors";
import { USER_ROLES } from "@common/constants/environment";
import * as routes from "@/constants/routes";

const propTypes = {
  activeButton: PropTypes.string.isRequired,
  openSubMenuKey: PropTypes.arrayOf(PropTypes.string).isRequired,
  userRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export class AdminNavigation extends Component {
  ifActiveButton = (route) => (includes(this.props.activeButton, route) ? "active-menu-btn" : "");

  render() {
    const isAdmin = this.props.userRoles.includes(USER_ROLES[Permission.ADMIN]);
    const canEditTemplateConditions = this.props.userRoles.includes(
      USER_ROLES[Permission.EDIT_TEMPLATE_PERMIT_CONDITIONS]
    );
    return (
      <Menu mode="horizontal" selectedKeys={this.props.openSubMenuKey}>
        {canEditTemplateConditions && (
          <Menu.SubMenu
            id={this.ifActiveButton("permit-conditions")}
            title={
              <span>
                Permit Conditions
                <DownOutlined className="padding-sm--left" />
              </span>
            }
          >
            <Menu className="sub-menu">
              <Menu.Item key="SAG">
                <Link to={routes.ADMIN_PERMIT_CONDITION.dynamicRoute("SAG")}>
                  Sand & Gravel Permit
                </Link>
              </Menu.Item>
              <Menu.Item key="MIN">
                <Link to={routes.ADMIN_PERMIT_CONDITION.dynamicRoute("MIN")}>MX/CX Permit</Link>
              </Menu.Item>
              <Menu.Item key="QCA">
                <Link to={routes.ADMIN_PERMIT_CONDITION.dynamicRoute("QCA")}>Quarry Permit</Link>
              </Menu.Item>
              <Menu.Item key="PLA">
                <Link to={routes.ADMIN_PERMIT_CONDITION.dynamicRoute("PLA")}>Placer Permit</Link>
              </Menu.Item>
            </Menu>
          </Menu.SubMenu>
        )}
        {isAdmin && (
          <Menu.SubMenu
            id={this.ifActiveButton("permits-and-approvals")}
            title={
              <span>
                Mine Verification
                <DownOutlined className="padding-sm--left" />
              </span>
            }
          >
            <Menu className="sub-menu">
              <Menu.Item key="permits">
                <Link to={routes.ADMIN_VERIFIED_MINES.dynamicRoute("verified")}>
                  Verified Mines
                </Link>
              </Menu.Item>
              <Menu.Item key="securities">
                <Link to={routes.ADMIN_VERIFIED_MINES.dynamicRoute("unverified")}>
                  UnVerified Mines
                </Link>
              </Menu.Item>
            </Menu>
          </Menu.SubMenu>
        )}
        {isAdmin && (
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
        )}
      </Menu>
    );
  }
}

AdminNavigation.propTypes = propTypes;

const mapStateToProps = (state) => ({
  userRoles: getUserAccessData(state),
});

export default connect(mapStateToProps)(AdminNavigation);
