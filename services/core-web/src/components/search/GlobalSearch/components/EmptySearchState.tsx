import React from "react";
import { Space, Typography, Button, Row, Col, Avatar } from "antd";
import {
  SearchOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

interface EmptySearchStateProps {
  hasSearchTerm: boolean;
  scopeToMine: boolean;
  activeFiltersCount: number;
  searchTerm?: string;
  onViewAll?: () => void;
  onQuickAction?: (route: string) => void;
  quickActions?: Array<{ icon: React.ReactNode; label: string; color: string; route: string }>;
}

export const EmptySearchState: React.FC<EmptySearchStateProps> = ({
  hasSearchTerm,
  scopeToMine,
  activeFiltersCount,
  searchTerm,
  onViewAll,
  onQuickAction,
  quickActions,
}) => {
  if (hasSearchTerm) {
    return (
      <div className="global-search__empty">
        <Space direction="vertical" align="center" style={{ width: "100%", padding: 32 }}>
          <SearchOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />
          <Title level={5}>No results found</Title>
          <Text type="secondary">
            {scopeToMine && !searchTerm
              ? "No items found for this mine"
              : activeFiltersCount > 0
                ? "Try removing some filters or adjusting your search"
                : "Try adjusting your search or browse all results"}
          </Text>
          {searchTerm && onViewAll && (
            <Button type="primary" onClick={onViewAll}>
              See all results for "{searchTerm}"
            </Button>
          )}
        </Space>
      </div>
    );
  }

  // Default state with quick actions
  const defaultQuickActions = quickActions || [
    {
      icon: <EnvironmentOutlined />,
      label: "Browse Mines",
      color: "#2e7d32",
      route: "/mine-home-page",
    },
    {
      icon: <TeamOutlined />,
      label: "Browse Contacts",
      color: "#1565c0",
      route: "/contact-home-page",
    },
    {
      icon: <FileSearchOutlined />,
      label: "Reports",
      color: "#7b1fa2",
      route: "/reports",
    },
  ];

  return (
    <Space direction="vertical" style={{ width: "100%", padding: "16px 20px" }}>
      <Text type="secondary">
        <SearchOutlined /> Quick Actions
      </Text>
      <Row gutter={[8, 8]}>
        {defaultQuickActions.map((action) => (
          <Col span={8} key={action.label}>
            <Button
              type="text"
              block
              onClick={() => onQuickAction?.(action.route)}
              style={{ height: "auto", padding: "12px 8px" }}
            >
              <Space direction="vertical" size={4}>
                <Avatar
                  icon={action.icon}
                  style={{ backgroundColor: `${action.color}20`, color: action.color }}
                />
                <Text style={{ fontSize: 12 }}>{action.label}</Text>
              </Space>
            </Button>
          </Col>
        ))}
      </Row>
    </Space>
  );
};
