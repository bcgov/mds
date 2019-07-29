import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Menu } from "antd";
import * as route from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";

const { SubMenu } = Menu;

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
};

export class MineNavigation extends Component {
  state = {
    current: "General",
  };

  handleClick = (e) => {
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
            <Menu.Item key="Contacts">
              <Link to={route.MINE_CONTACTS.dynamicRoute(this.props.mine.mine_guid)}>Contacts</Link>
            </Menu.Item>
          </Menu>
        </SubMenu>
        <SubMenu title={<span className="submenu-title-wrapper">Permits & Approvals</span>}>
          <Menu>
            {this.props.mine.major_mine_ind && (
              <Menu.Item key="Permit Applications">
                <Link to={route.MINE_PERMIT_APPLICATIONS.dynamicRoute(this.props.mine.mine_guid)}>
                  Permit Applications
                </Link>
              </Menu.Item>
            )}
            <Menu.Item key="Permits">
              <Link to={route.MINE_PERMITS.dynamicRoute(this.props.mine.mine_guid)}>Permits</Link>
            </Menu.Item>
            <Menu.Item key="Variances">Variances</Menu.Item>
          </Menu>
        </SubMenu>
        <SubMenu title={<span className="submenu-title-wrapper">Oversight</span>}>
          <Menu>
            <Menu.Item key="Incidents">Compliance</Menu.Item>
          </Menu>
          <Menu>
            <Menu.Item key="Incidents">Incidents & Investigations</Menu.Item>
          </Menu>
        </SubMenu>
        <SubMenu title={<span className="submenu-title-wrapper">Reports</span>}>
          <Menu>
            <Menu.Item key="Tailings">Tailings</Menu.Item>
          </Menu>
        </SubMenu>
      </Menu>
    );
  }
}

MineNavigation.propTypes = propTypes;

export default MineNavigation;
