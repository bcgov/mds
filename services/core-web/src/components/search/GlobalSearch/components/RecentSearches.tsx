import React from "react";
import { List, Space, Divider } from "antd";
import { HistoryOutlined, ClockCircleOutlined, DeleteOutlined } from "@ant-design/icons";
import classNames from "classnames";

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
    <div className="recent-searches">
      <Divider orientation="left" plain className="recent-searches__divider">
        <Space>
          <HistoryOutlined />
          Recent Searches
        </Space>
      </Divider>
      <List
        dataSource={recentSearches}
        renderItem={(term, index) => {
          const isSelected = index === selectedIndex;
          const [isHovered, setIsHovered] = React.useState(false);

          return (
            <List.Item
              onClick={() => onSearchClick(term)}
              onMouseEnter={() => {
                onSetSelectedIndex(index);
                setIsHovered(true);
              }}
              onMouseLeave={() => setIsHovered(false)}
              className={classNames("recent-searches__item", {
                "recent-searches__item--selected": isSelected,
                "recent-searches__item--hovered": isHovered && !isSelected
              })}
              extra={
                <DeleteOutlined
                  onClick={(e) => onRemoveSearch(term, e)}
                  className="recent-searches__delete-icon"
                />
              }
            >
              <List.Item.Meta avatar={<ClockCircleOutlined className="recent-searches__icon" />} title={term} />
            </List.Item>
          );
        }}
        split={false}
      />
    </div>
  );
};
