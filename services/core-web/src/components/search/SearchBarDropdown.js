import React from "react";
import PropTypes from "prop-types";
import { Menu, Icon } from "antd";
import * as route from "@/constants/routes";

import { MINE, TEAM } from "@/constants/assets";

const propTypes = {
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  searchTerm: PropTypes.string.isRequired,
  searchTermHistory: PropTypes.arrayOf(PropTypes.string).isRequired,
  searchBarResults: PropTypes.arrayOf(PropTypes.any).isRequired,
};

const staticMenuItems = [
  <Menu.ItemGroup title="Lookup">
    <Menu.Item key="/dashboard/mines">
      <p>
        <img
          alt="Mine"
          className="padding-small--right vertical-align-sm icon-svg-filter"
          height="25px"
          src={MINE}
        />{" "}
        Mines
      </p>
    </Menu.Item>
    ,
    <Menu.Item key="/dashboard/contacts">
      <p>
        <img
          alt="team"
          className="padding-small--right vertical-align-sm icon-svg-filter"
          height="25px"
          src={TEAM}
        />{" "}
        Contacts
      </p>
    </Menu.Item>
  </Menu.ItemGroup>,
];

const URLFor = (item) =>
  ({
    mine: route.MINE_GENERAL.dynamicRoute(item.result.id),
    party: route.PARTY_PROFILE.dynamicRoute(item.result.id),
    permit: route.MINE_PERMITS.dynamicRoute(item.result.id),
  }[item.type]);

export const SearchBarDropdown = (props) => (
  <Menu
    onMouseDown={(e) => {
      e.target.click(e);
    }}
    onClick={({ key }) => props.history.push(key)}
    selectable={false}
  >
    {props.searchTerm.length && props.searchBarResults.length
      ? [
          props.searchBarResults.map((item) => (
            <Menu.Item key={URLFor(item)}>
              <p>{`${item.result.value || ""}`}</p>
            </Menu.Item>
          )),
          <Menu.Divider />,
          <Menu.Item key={`/search?q=${props.searchTerm}`}>
            <h6>{`See all results for "${props.searchTerm}"`}</h6>
          </Menu.Item>,
        ]
      : [
          staticMenuItems,
          props.searchTermHistory.length && [
            <Menu.Divider />,
            <Menu.ItemGroup title="Recent searches">
              {props.searchTermHistory.map((pastSearchTerm) => (
                <Menu.Item key={`/search?q=${pastSearchTerm}`}>
                  <p style={{ fontStyle: "italic" }}>
                    <Icon type="search" /> {pastSearchTerm}
                  </p>
                </Menu.Item>
              ))}
            </Menu.ItemGroup>,
          ],
        ]}
  </Menu>
);

SearchBarDropdown.propTypes = propTypes;

export default SearchBarDropdown;
