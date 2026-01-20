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
  const getFacetCount = (filterKey: string): number => {
    if (filterKey === "mine") return facets.mine ?? 0;
    if (filterKey === "contact") return facets.person ?? 0;
    if (filterKey === "organization") return facets.organization ?? 0;
    if (filterKey === "permit") return facets.permit ?? 0;
    if (filterKey === "explosives_permit") return facets.explosives_permit ?? 0;
    if (filterKey === "now_application") return facets.now_application ?? 0;
    if (filterKey === "nod") return facets.nod ?? 0;
    if (filterKey === "document") return (facets.mine_documents ?? 0) + (facets.permit_documents ?? 0);
    return 0;
  };

  return (
    <div style={{ padding: "8px 16px", borderBottom: "1px solid #f0f0f0" }}>
      <Space size={[4, 4]} wrap>
        {isOnMinePage && (
          <Tag
            onClick={() => onToggleScopeToMine(!scopeToMine)}
            style={{
              cursor: "pointer",
              backgroundColor: scopeToMine ? "#5e46a115" : "transparent",
              borderColor: scopeToMine ? "#5e46a1" : "#d9d9d9",
              color: scopeToMine ? "#5e46a1" : "#595959",
              margin: 0,
              fontWeight: scopeToMine ? 600 : 400,
            }}
          >
            <Space size={4}>
              <AimOutlined />
              <span>This Mine</span>
            </Space>
          </Tag>
        )}
        {isOnMinePage && <Divider type="vertical" style={{ margin: "0 4px", height: 20 }} />}
        {Object.entries(SEARCH_TYPE_CONFIG).map(([key, config]) => {
          const isActive = activeFilters.includes(key);
          const count = getFacetCount(key);

          return (
            <Tag
              key={key}
              onClick={() => onToggleFilter(key)}
              style={{
                cursor: "pointer",
                backgroundColor: isActive ? `${config.color}15` : "transparent",
                borderColor: isActive ? config.color : "#d9d9d9",
                color: isActive ? config.color : "#595959",
                margin: 0,
              }}
            >
              <Space size={4}>
                {config.icon}
                <span>{config.pluralLabel}</span>
                {searchTerm && <span style={{ opacity: 0.6 }}>({count})</span>}
              </Space>
            </Tag>
          );
        })}
      </Space>
    </div>
  );
};
