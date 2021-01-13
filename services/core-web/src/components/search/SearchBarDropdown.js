import React from "react";
import PropTypes from "prop-types";
import { Menu } from "antd";
import { SearchOutlined, FileSearchOutlined } from "@ant-design/icons";
import * as route from "@/constants/routes";

import { MINE, PROFILE_NOCIRCLE, DOC } from "@/constants/assets";

const propTypes = {
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  searchTerm: PropTypes.string.isRequired,
  searchTermHistory: PropTypes.arrayOf(PropTypes.string).isRequired,
  searchBarResults: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export const SearchBarDropdown = (props) => {
  const URLFor = (item) =>
    ({
      mine: route.MINE_GENERAL.dynamicRoute(item.result.id),
      party: route.PARTY_PROFILE.dynamicRoute(item.result.id),
      permit: route.SEARCH_RESULTS.dynamicRoute({ q: item.result.value }),
    }[item.type]);

  const IconFor = (item) =>
    ({
      mine: <img className="icon-svg-filter" src={MINE} alt={item.value} height={25} />,
      party: (
        <img className="icon-svg-filter" src={PROFILE_NOCIRCLE} alt={item.value} height={25} />
      ),
      permit: <img className="icon-svg-filter" src={DOC} alt={item.value} height={25} />,
    }[item.type]);

  return (
    <Menu
      onMouseDown={(e) => {
        e.target.click(e);
      }}
      onClick={({ key }) => props.history.push(key)}
      selectable={false}
    >
      {props.searchTerm.length
        ? [
            <Menu.Item key={`/search?q=${props.searchTerm}`}>
              <p className="btn--middle">
                <FileSearchOutlined className="icon-lg icon-svg-filter" />
                See All
              </p>
            </Menu.Item>,
            <Menu.Divider />,
            props.searchBarResults && props.searchBarResults.length > 0 && (
              <Menu.ItemGroup title="Quick results">
                {props.searchBarResults.map((item) => (
                  <Menu.Item key={URLFor(item)}>
                    <p>
                      {IconFor(item)}
                      {`${item.result.value || ""}`}
                    </p>
                  </Menu.Item>
                ))}
              </Menu.ItemGroup>
            ),
          ]
        : [
            props.searchTermHistory.length ? (
              [
                <Menu.Divider />,
                <Menu.ItemGroup title="Recent searches">
                  {props.searchTermHistory.map((pastSearchTerm) => (
                    <Menu.Item key={`/search?q=${pastSearchTerm}`}>
                      <p className="btn--middle" style={{ fontStyle: "italic" }}>
                        <SearchOutlined />
                        {pastSearchTerm}
                      </p>
                    </Menu.Item>
                  ))}
                </Menu.ItemGroup>,
              ]
            ) : (
              <Menu.ItemGroup title="Enter your search, then hit enter or click the 'See All' option" />
            ),
          ]}
    </Menu>
  );
};

SearchBarDropdown.propTypes = propTypes;

export default SearchBarDropdown;
