/* eslint-disable  */
import React, { Component } from "react";
import { Link } from "react-router-dom";
import * as route from "@/constants/routes";
import { Menu } from "antd";

const { SubMenu } = Menu;

export class MineNavigation extends Component {
  state = {
    current: "mail",
  };

  handleClick = (e) => {
    console.log("click ", e);
    this.setState({
      current: e.key,
    });
  };

  render() {
    return (
      <Menu onClick={this.handleClick} selectedKeys={[this.state.current]} mode="horizontal">
        <SubMenu title={<span className="submenu-title-wrapper">Mine Information</span>}>
          <Menu>
            <Menu.Item key="General">
              <Link to={route.MINE_GENERAL.dynamicRoute(this.props.mine.mine_guid)}>General</Link>
            </Menu.Item>
            <Menu.Item key="Contacts">Contacts</Menu.Item>
          </Menu>
        </SubMenu>
        <SubMenu title={<span className="submenu-title-wrapper">Permits & Approvals</span>}>
          <Menu>
            <Menu.Item key="Permit Applications">Permit Applications</Menu.Item>
            <Menu.Item key="Permits">Permits</Menu.Item>
            <Menu.Item key="Variances">Variances</Menu.Item>
          </Menu>
        </SubMenu>
        <SubMenu title={<span className="submenu-title-wrapper">Oversight</span>}>
          <Menu>
            <Menu.Item key="setting:1">Incidents & Investigations</Menu.Item>
            <Menu.Item key="setting:2">Variances</Menu.Item>
          </Menu>
        </SubMenu>
        <SubMenu title={<span className="submenu-title-wrapper">Reports</span>}>
          <Menu>
            <Menu.Item key="setting:1">Tailings</Menu.Item>
          </Menu>
        </SubMenu>
      </Menu>
    );
  }
}

export default MineNavigation;
