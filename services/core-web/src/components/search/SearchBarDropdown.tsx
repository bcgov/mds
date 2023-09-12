import React, { FC } from "react";
import { Dropdown, MenuProps } from "antd";
import { SearchOutlined, FileSearchOutlined } from "@ant-design/icons";

import * as route from "@/constants/routes";
import { MINE, PROFILE_NOCIRCLE, DOC } from "@/constants/assets";
import { ISearchResult } from "@mds/common";

interface SearchBarDropdownProps {
  history: any;
  searchTerm: string;
  searchTermHistory: string[];
  searchBarResults: ISearchResult[];
  children: React.ReactNode;
}

export const SearchBarDropdown: FC<SearchBarDropdownProps> = ({
  history,
  searchTerm,
  searchTermHistory,
  searchBarResults,
  children,
}) => {
  const URLFor = (item: ISearchResult) =>
    ({
      mine: route.MINE_GENERAL.dynamicRoute(item.result.id),
      party: route.PARTY_PROFILE.dynamicRoute(item.result.id),
      permit: route.SEARCH_RESULTS.dynamicRoute({ q: item.result.value }),
    }[item.type]);

  const IconFor = (item: ISearchResult) =>
    ({
      mine: <img className="icon-svg-filter" src={MINE} alt={item.value} height={25} />,
      party: (
        <img className="icon-svg-filter" src={PROFILE_NOCIRCLE} alt={item.value} height={25} />
      ),
      permit: <img className="icon-svg-filter" src={DOC} alt={item.value} height={25} />,
    }[item.type]);

  const getDropdownMenuItems = () => {
    let items: MenuProps["items"] = [];

    if (searchTerm.length) {
      items = [
        {
          key: `/search?q=${searchTerm}`,
          label: (
            <p className="btn--middle">
              <FileSearchOutlined className="icon-lg icon-svg-filter" />
              See All
            </p>
          ),
        },
      ];
      if (searchBarResults.length) {
        const newItems: MenuProps["items"] = [
          { type: "divider" },
          {
            key: "search-dd-quick",
            type: "group",
            label: "Quick results",
            children: searchBarResults.map((item) => ({
              key: URLFor(item),
              label: (
                <p>
                  {IconFor(item)}
                  {`${item.result.value || ""}`}
                </p>
              ),
            })),
          },
        ];
        items = [...items, ...newItems];
      }
    } else if (!searchTermHistory.length && !searchTerm.length) {
      items = [
        {
          key: "search-dd-empty",
          type: "group",
          label: "Enter your search, then hit enter or click the 'See All' option",
        },
      ];
    } else if (searchTermHistory.length) {
      items = [
        {
          key: "search-dd-recent",
          type: "group",
          label: "Recent searches",
          children: searchTermHistory.map((pastSearchTerm) => ({
            key: `/search?q=${pastSearchTerm}`,
            label: (
              <p className="btn--middle" style={{ fontStyle: "italic" }}>
                <SearchOutlined />
                {pastSearchTerm}
              </p>
            ),
          })),
        },
      ];
    }
    return items;
  };

  const menuItems = getDropdownMenuItems();

  const handleDropdownClick = (params) => {
    const { key } = params;
    history.push(key);
  };

  return (
    <Dropdown
      menu={{
        items: menuItems,
        onClick: handleDropdownClick,
      }}
    >
      {children}
    </Dropdown>
  );
};

export default SearchBarDropdown;
