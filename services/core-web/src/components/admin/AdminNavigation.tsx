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

export const AdminNavigation = (props) => {
  const ifActiveButton = (route) => (includes(props.activeButton, route) ? "active-menu-btn" : "");

  const items = [
    {
      label: "Mine Verification",
      icon: <DownOutlined />,
      key: "submenu-mine-verification",
      id: ifActiveButton("mine-verification"),
      children: [
        {
          key: "verified",
          label: (
            <Link to={routes.ADMIN_VERIFIED_MINES.dynamicRoute("verified")}>Verified Mines</Link>
          ),
        },
        {
          key: "unverified",
          label: (
            <Link to={routes.ADMIN_VERIFIED_MINES.dynamicRoute("unverified")}>
              UnVerified Mines
            </Link>
          ),
        },
      ],
    },
    {
      label: "MineSpace Management",
      icon: <DownOutlined />,
      key: "submenu-manage-minespace",
      id: ifActiveButton("manage-minespace"),
      children: [
        { key: "users", label: <Link to={routes.ADMIN_MANAGE_MINESPACE_USERS.route}>Users</Link> },
      ],
    },
  ];

  return (
    <Menu
      mode="horizontal"
      selectedKeys={props.openSubMenuKey}
      items={items}
      className="item-menu"
    />
  );
};

AdminNavigation.propTypes = propTypes;
export default AdminNavigation;
