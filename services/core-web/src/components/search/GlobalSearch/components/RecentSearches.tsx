import React from "react";
import { List, Space, Divider } from "antd";
import { HistoryOutlined, ClockCircleOutlined, DeleteOutlined } from "@ant-design/icons";

interface RecentSearchesProps {
  recentSearches: string[];
  selectedIndex: number;
  onSearchClick: (term: string) => void;
  onRemoveSearch: (term: string, e: React.MouseEvent) => void;
  onSetSelectedIndex: (index: number) => void;
}

export const RecentSearches: React.FC<RecentSearchesProps> = ({
  recentSearches,
  selectedIndex,
  onSearchClick,
  onRemoveSearch,
  onSetSelectedIndex,
}) => {
  return (
    <div className="global-search__recent">
      <Divider orientation="left" plain style={{ margin: "8px 0", fontSize: 12 }}>
        <Space>
          <HistoryOutlined />
          Recent Searches
        </Space>
      </Divider>
      <List
        dataSource={recentSearches}
        renderItem={(term, index) => (
          <List.Item
            className={`global-search__result-item ${index === selectedIndex ? "global-search__result-item--selected" : ""}`}
            onClick={() => onSearchClick(term)}
            onMouseEnter={() => onSetSelectedIndex(index)}
            extra={
              <DeleteOutlined
                onClick={(e) => onRemoveSearch(term, e)}
                style={{ color: "#bfbfbf", cursor: "pointer", padding: 4 }}
              />
            }
          >
            <List.Item.Meta avatar={<ClockCircleOutlined style={{ color: "#bfbfbf" }} />} title={term} />
          </List.Item>
        )}
        split={false}
      />
    </div>
  );
};
