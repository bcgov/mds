import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Menu } from "antd";
import { includes } from "lodash";
import * as routes from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";

const { SubMenu } = Menu;

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  activeButton: PropTypes.string.isRequired,
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

  ifActiveButton = (route) => (includes(this.props.activeButton, route) ? "active-menu-btn" : "");

  render() {
    return (
      <Menu onClick={this.handleClick} selectedKeys={[this.state.current]} mode="horizontal">
        <SubMenu id={this.ifActiveButton("mine-information")} title="Mine Information">
          <Menu>
            <Menu.Item key="General">
              <Link to={routes.MINE_GENERAL.dynamicroute(this.props.mine.mine_guid)}>General</Link>
            </Menu.Item>
            <Menu.Item key="Contacts">
              <Link to={routes.MINE_CONTACTS.dynamicroute(this.props.mine.mine_guid)}>
                Contacts
              </Link>
            </Menu.Item>
          </Menu>
        </SubMenu>
        <SubMenu id={this.ifActiveButton("permits-and-approvals")} title="Permits & Approvals">
          <Menu>
            {this.props.mine.major_mine_ind && (
              <Menu.Item key="Permit Applications">
                <Link to={routes.MINE_PERMIT_APPLICATIONS.dynamicroute(this.props.mine.mine_guid)}>
                  Permit Applications
                </Link>
              </Menu.Item>
            )}
            <Menu.Item key="Permits">
              <Link to={routes.MINE_PERMITS.dynamicroute(this.props.mine.mine_guid)}>Permits</Link>
            </Menu.Item>
            <Menu.Item key="Variances">
              <Link to={routes.MINE_VARIANCES.dynamicroute(this.props.mine.mine_guid)}>
                Variances
              </Link>
            </Menu.Item>
          </Menu>
        </SubMenu>
        <SubMenu title="Oversight">
          <Menu>
            <Menu.Item key="Inspections">
              <Link to={routes.MINE_INSPECTIONS.dynamicroute(this.props.mine.mine_guid)}>
                Inspections & Audits
              </Link>
            </Menu.Item>
          </Menu>
          <Menu>
            <Menu.Item key="Incidents">
              <Link to={routes.MINE_INCIDENTS.dynamicroute(this.props.mine.mine_guid)}>
                Incidents & Investigations
              </Link>
            </Menu.Item>
          </Menu>
        </SubMenu>
        {/* TO DO: Move this condition to wrap Menu.Item Tailings when this dropdown has more options */}
        {this.props.mine.mine_tailings_storage_facilities.length > 0 && (
          <SubMenu title="Reports">
            <Menu>
              <Menu.Item key="Tailings">
                <Link to={routes.MINE_TAILINGS.dynamicroute(this.props.mine.mine_guid)}>
                  Tailings
                </Link>
              </Menu.Item>
            </Menu>
          </SubMenu>
        )}
      </Menu>
    );
  }
}

MineNavigation.propTypes = propTypes;

export default MineNavigation;
