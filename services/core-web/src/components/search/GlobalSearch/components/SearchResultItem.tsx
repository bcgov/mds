import React from "react";
import { List, Avatar, Typography } from "antd";
import { EnterOutlined } from "@ant-design/icons";
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
  const configKey = RESULT_TYPE_MAP[item.type] || "document";
  const config = SEARCH_TYPE_CONFIG[configKey];
  const isSelected = index === selectedIndex;

  return (
    <List.Item
      className={`global-search__result-item ${isSelected ? "global-search__result-item--selected" : ""}`}
      onClick={() => onClick(item)}
      onMouseEnter={() => onMouseEnter(index)}
    >
      <List.Item.Meta
        avatar={
          <Avatar
            icon={config.icon}
            style={{ backgroundColor: `${config.color}20`, color: config.color }}
          />
        }
        title={<Text strong={isSelected}>{highlightMatch(item.result.value, searchTerm)}</Text>}
        description={
          <Text type="secondary">
            {config.label}
            {item.result.description && <span style={{ marginLeft: 8 }}>• {item.result.description}</span>}
            {item.result.highlight && (
              <span
                style={{ marginLeft: 8, fontStyle: "italic" }}
                dangerouslySetInnerHTML={{ __html: `• ${item.result.highlight}` }}
              />
            )}
          </Text>
        }
      />
      {isSelected && <EnterOutlined style={{ color: "#5e46a1" }} />}
    </List.Item>
  );
};
