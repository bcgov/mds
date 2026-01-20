import React from "react";
import { Button, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface SearchTriggerButtonProps {
  onClick: () => void;
  placeholder?: string;
}

export const SearchTriggerButton: React.FC<SearchTriggerButtonProps> = ({ 
  onClick, 
  placeholder = "Search Core..." 
}) => {
  return (
    <Button className="global-search-trigger" onClick={onClick} icon={<SearchOutlined />}>
      <span className="search-placeholder">{placeholder}</span>
      <span className="search-shortcut">
        <Text keyboard>⌘</Text>
        <Text keyboard>K</Text>
      </span>
    </Button>
  );
};
