import React from "react";
import { Tag, Space, Divider } from "antd";
import { AimOutlined } from "@ant-design/icons";
import classNames from "classnames";
import { SEARCH_TYPE_CONFIG } from "../utils/searchConfig";
import "@/styles/components/SearchFilters.scss";

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
    <div className="search-filters">
      <Space size={[4, 4]} wrap className="search-filters__container">
        {isOnMinePage && (
          <Tag.CheckableTag
            checked={scopeToMine}
            onChange={(checked) => onToggleScopeToMine(checked)}
            className={classNames("search-filters__tag search-filters__tag--mine-scope", {
              "checked": scopeToMine
            })}
          >
            <Space size={4}>
              <AimOutlined />
              <span>This Mine</span>
            </Space>
          </Tag.CheckableTag>
        )}
        {isOnMinePage && <Divider type="vertical" className="search-filters__divider" />}
        {Object.entries(SEARCH_TYPE_CONFIG).map(([key, config]) => {
          const isActive = activeFilters.includes(key);
          const count = getFacetCount(key);

          return (
            <Tag.CheckableTag
              key={key}
              checked={isActive}
              onChange={() => onToggleFilter(key)}
              className="search-filters__tag"
              style={{
                border: `1px solid ${isActive ? config.color : "#d9d9d9"}`,
                color: isActive ? config.color : "#595959",
              }}
            >
              <Space size={4}>
                {config.icon}
                <span>{config.pluralLabel}</span>
                {searchTerm && count > 0 && <span className="search-filters__count">({count})</span>}
              </Space>
            </Tag.CheckableTag>
          );
        })}
      </Space>
    </div>
  );
};
