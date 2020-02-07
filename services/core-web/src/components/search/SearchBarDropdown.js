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

export const SearchBarDropdown = (props) => {
  const createStaticMenuItem = (text, url, img) => (
    <Menu.Item key={url}>
      <p>
        <img className="icon-svg-filter" src={img} alt={text} height={25} />
        {text}
      </p>
    </Menu.Item>
  );

  const staticMenuItems = [
    <Menu.ItemGroup title="Look up">
      {createStaticMenuItem("Mines", route.MINE_HOME_PAGE.route, MINE)}
      {createStaticMenuItem("Contacts", route.CONTACT_HOME_PAGE.route, TEAM)}
    </Menu.ItemGroup>,
  ];

  const URLFor = (item) =>
    ({
      mine: route.MINE_GENERAL.dynamicRoute(item.result.id),
      party: route.PARTY_PROFILE.dynamicRoute(item.result.id),
      permit: route.MINE_PERMITS.dynamicRoute(item.result.id),
    }[item.type]);

  return (
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
              <p>
                <Icon className="icon-lg icon-svg-filter" type="file-search" />
                See all results...
              </p>
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
};

SearchBarDropdown.propTypes = propTypes;

export default SearchBarDropdown;
