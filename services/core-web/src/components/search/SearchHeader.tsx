import React from "react";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

interface SearchHeaderProps {
  searchInputValue: string;
  onSearchInputChange: (value: string) => void;
  onSearch: (value: string) => void;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  searchInputValue,
  onSearchInputChange,
  onSearch,
}) => {
  return (
    <div className="landing-page__header">
      <div className="inline-flex between center-mobile">
        <div>
          <h1>Search Results</h1>
        </div>
      </div>
      <div style={{ marginTop: 16, maxWidth: 600 }}>
        <Input.Search
          placeholder="Search for mines, contacts, permits..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          value={searchInputValue}
          onChange={(e) => onSearchInputChange(e.target.value)}
          onSearch={onSearch}
        />
      </div>
    </div>
  );
};
