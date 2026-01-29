import React from "react";
import { Tag, Space, Divider } from "antd";
import { AimOutlined } from "@ant-design/icons";
import { SEARCH_TYPE_CONFIG } from "../utils/searchConfig";

interface SearchFiltersProps {
  activeFilters: string[];
  onToggleFilter: (filterKey: string) => void;
  facets: Record<string, number>;
  isOnMinePage: boolean;
  scopeToMine: boolean;
  onToggleScopeToMine: (checked: boolean) => void;
  searchTerm: string;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  activeFilters,
  onToggleFilter,
  facets,
  isOnMinePage,
  scopeToMine,
  onToggleScopeToMine,
  searchTerm,
}) => {
  const facetCountMap: Record<string, number> = {
    mine: facets.mine ?? 0,
    contact: facets.person ?? 0,
    organization: facets.organization ?? 0,
    permit: facets.permit ?? 0,
    explosives_permit: facets.explosives_permit ?? 0,
    now_application: facets.now_application ?? 0,
    nod: facets.nod ?? 0,
    document: (facets.mine_documents ?? 0) + (facets.permit_documents ?? 0),
  };

  const getFacetCount = (filterKey: string): number => facetCountMap[filterKey] ?? 0;

  return (
    <div style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>
      <Space size={[4, 4]} wrap style={{ padding: '0 8px' }}>
        {isOnMinePage && (
          <Tag.CheckableTag
            checked={scopeToMine}
            onChange={(checked) => onToggleScopeToMine(checked)}
            style={{
              border: `1px solid ${scopeToMine ? "#5e46a1" : "#d9d9d9"}`,
              borderRadius: 4,
              padding: '0 8px',
              fontSize: 13,
            }}
          >
            <Space size={4}>
              <AimOutlined />
              <span>This Mine</span>
            </Space>
          </Tag.CheckableTag>
        )}
        {isOnMinePage && <Divider type="vertical" style={{ margin: "0 4px", height: 20 }} />}
        {Object.entries(SEARCH_TYPE_CONFIG).map(([key, config]) => {
          const isActive = activeFilters.includes(key);
          const count = getFacetCount(key);

          return (
            <Tag.CheckableTag
              key={key}
              checked={isActive}
              onChange={() => onToggleFilter(key)}
              style={{
                border: `1px solid ${isActive ? config.color : "#d9d9d9"}`,
                color: isActive ? config.color : "#595959",
                borderRadius: 4,
                padding: '0 8px',
                fontSize: 13,
              }}
            >
              <Space size={4}>
                {config.icon}
                <span>{config.pluralLabel}</span>
                {searchTerm && count > 0 && <span style={{ opacity: 0.6 }}>({count})</span>}
              </Space>
            </Tag.CheckableTag>
          );
        })}
      </Space>
    </div>
  );
};
