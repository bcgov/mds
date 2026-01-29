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
    <div>
      <Divider orientation="left" plain style={{ margin: "8px 0", fontSize: 12 }}>
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
          
          const getBackground = () => {
            if (isSelected) return 'rgba(94, 70, 161, 0.08)';
            if (isHovered) return 'rgba(94, 70, 161, 0.04)';
            return 'transparent';
          };

          return (
            <List.Item
              onClick={() => onSearchClick(term)}
              onMouseEnter={() => {
                onSetSelectedIndex(index);
                setIsHovered(true);
              }}
              onMouseLeave={() => setIsHovered(false)}
              style={{
                cursor: 'pointer',
                borderLeft: `2px solid ${isSelected ? '#5e46a1' : 'transparent'}`,
                background: getBackground(),
                padding: '8px 16px',
                transition: 'all 0.2s',
              }}
              extra={
                <DeleteOutlined
                  onClick={(e) => onRemoveSearch(term, e)}
                  style={{ color: "#bfbfbf", cursor: "pointer", padding: 4 }}
                />
              }
            >
              <List.Item.Meta avatar={<ClockCircleOutlined style={{ color: "#bfbfbf" }} />} title={term} />
            </List.Item>
          );
        }}
        split={false}
      />
    </div>
  );
};
