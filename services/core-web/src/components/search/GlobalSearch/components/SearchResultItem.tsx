import React, { useState } from "react";
import { List, Avatar, Typography } from "antd";
import { EnterOutlined } from "@ant-design/icons";
import classNames from "classnames";
import { ISearchResult, ISimpleSearchResult } from "@mds/common/interfaces";
import { SEARCH_TYPE_CONFIG, RESULT_TYPE_MAP } from "../utils/searchConfig";
import { highlightMatch } from "../utils/searchHelpers";

const { Text } = Typography;

interface SearchResultItemProps {
  item: ISearchResult<ISimpleSearchResult>;
  index: number;
  selectedIndex: number;
  searchTerm: string;
  onClick: (item: ISearchResult<ISimpleSearchResult>) => void;
  onMouseEnter: (index: number) => void;
}

export const SearchResultItem: React.FC<SearchResultItemProps> = ({
  item,
  index,
  selectedIndex,
  searchTerm,
  onClick,
  onMouseEnter,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const configKey = RESULT_TYPE_MAP[item.type] || "document";
  const config = SEARCH_TYPE_CONFIG[configKey];
  const isSelected = index === selectedIndex;

  return (
    <List.Item
      onClick={() => onClick(item)}
      onMouseEnter={() => {
        onMouseEnter(index);
        setIsHovered(true);
      }}
      onMouseLeave={() => setIsHovered(false)}
      className={classNames("search-result-item", {
        "search-result-item--selected": isSelected,
        "search-result-item--hovered": isHovered && !isSelected
      })}
    >
      <List.Item.Meta
        avatar={
          <Avatar
            icon={config.icon}
            style={{ backgroundColor: `${config.color}20`, color: config.color }}
          />
        }
        title={<Text strong={isSelected} className="search-result-item__title">{highlightMatch(item.result.value, searchTerm)}</Text>}
        description={
          <Text type="secondary" ellipsis>
            {config.label}
            {item.result.description && <span style={{ marginLeft: 8 }}>• {item.result.description}</span>}
            {item.result.highlight && (
              <span
                className="search-result-item__highlight"
                dangerouslySetInnerHTML={{ __html: `• ${item.result.highlight}` }}
              />
            )}
          </Text>
        }
      />
      <EnterOutlined className="search-result-item__enter-icon" style={{ visibility: isSelected ? 'visible' : 'hidden' }} />
    </List.Item>
  );
};
