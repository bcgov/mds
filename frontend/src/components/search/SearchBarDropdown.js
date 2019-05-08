import React from "react";
import PropTypes from "prop-types";

import { Menu, Icon } from "antd";
import { MINE, TEAM } from "@/constants/assets";

const propTypes = {
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  search: PropTypes.func.isRequired,
  searchTerm: PropTypes.string.isRequired,
  searchTermHistory: PropTypes.arrayOf(PropTypes.string).isRequired,
  searchResults: PropTypes.arrayOf(PropTypes.any).isRequired,
};

const staticMenuItems = [
  <Menu.ItemGroup title="Search for" />,
  <Menu.Item key="dashboard/mines">
    <p>
      <img
        alt="Mine"
        className="padding-small--right vertical-align-sm icon-svg-filter"
        height="25px"
        src={MINE}
      />{" "}
      Mines
    </p>
  </Menu.Item>,
  <Menu.Item key="dashboard/contacts">
    <p>
      <img
        alt="team"
        className="padding-small--right vertical-align-sm icon-svg-filter"
        height="25px"
        src={TEAM}
      />{" "}
      Contacts
    </p>
  </Menu.Item>,
];

export const SearchBarDropdown = (props) => (
  <Menu
    onMouseDown={(e) => {
      e.target.click(e);
    }}
    onClick={({ key }) =>
      key === "search" ? props.search(props.searchTerm) : props.history.push(`/${key}`)
    }
    selectable={false}
  >
    {props.searchTerm.length
      ? [
          props.searchResults.map((result) => (
            <Menu.Item>
              <p>{`${result.result.value || ""}`}</p>
            </Menu.Item>
          )),
          <Menu.Divider />,
          <Menu.Item key="search">
            <h6>{`See all results for "${props.searchTerm}"`}</h6>
          </Menu.Item>,
        ]
      : [
          staticMenuItems,
          props.searchTermHistory.length && [
            <Menu.Divider />,
            <Menu.ItemGroup title="Recent" />,
            props.searchTermHistory.map((pastSearchTerm) => (
              <Menu.Item key={pastSearchTerm}>
                <p style={{ fontStyle: "italic" }}>
                  <Icon type="search" /> {pastSearchTerm}
                </p>
              </Menu.Item>
            )),
          ],
        ]}
  </Menu>
);

SearchBarDropdown.propTypes = propTypes;

export default SearchBarDropdown;
