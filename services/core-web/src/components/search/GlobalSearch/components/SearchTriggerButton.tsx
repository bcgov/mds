import React, { CSSProperties, useState } from "react";
import { Button, Typography, Space } from "antd";
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
  const [isHovered, setIsHovered] = useState(false);

  const buttonStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    background: isHovered ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)',
    border: `1px solid ${isHovered ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.2)'}`,
    color: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 6,
    minWidth: 200,
    transition: 'all 0.2s',
  };

  return (
    <Button 
      onClick={onClick} 
      icon={<SearchOutlined style={{ color: 'inherit' }} />}
      style={buttonStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Space style={{ width: '100%', justifyContent: 'space-between' }} className="search-trigger-content">
        <Text style={{ color: 'inherit', opacity: 0.85 }} className="search-placeholder">{placeholder}</Text>
        <Space size={4} className="search-shortcut">
          <Text keyboard style={{ background: 'rgba(255, 255, 255, 0.2)', border: 'none' }}>⌘</Text>
          <Text keyboard style={{ background: 'rgba(255, 255, 255, 0.2)', border: 'none' }}>K</Text>
        </Space>
      </Space>
    </Button>
  );
};
