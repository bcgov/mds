import React, { useMemo } from "react";
import { Card, Typography, Tag, Button, Space, Checkbox, Collapse } from "antd";
import { FilterOutlined, ClearOutlined } from "@ant-design/icons";
import { FACET_GROUPS, FACET_LABELS, FacetBucket, SearchFacets } from "./searchResultsConfig";

const { Text } = Typography;
const { Panel } = Collapse;

interface SearchFiltersPanelProps {
  searchFacets: SearchFacets | null;
  selectedFilters: Record<string, string[]>;
  hasActiveFilters: boolean;
  onFilterChange: (category: string, value: string, checked: boolean) => void;
  onClearAllFilters: () => void;
}

export const SearchFiltersPanel: React.FC<SearchFiltersPanelProps> = ({
  searchFacets,
  selectedFilters,
  hasActiveFilters,
  onFilterChange,
  onClearAllFilters,
}) => {
  const groupedFacets = useMemo(() => {
    return FACET_GROUPS.map((group) => {
      const facets = group.facets
        .map((facetKey) => ({
          key: facetKey,
          label: FACET_LABELS[facetKey] || facetKey,
          data: searchFacets?.[facetKey as keyof SearchFacets] || [],
        }))
        .filter((f) => f.data.length > 0);

      return {
        ...group,
        facets: facets,
      };
    }).filter((group) => group.facets.length > 0);
  }, [searchFacets]);

  return (
    <Card size="small" className="search-results-v2__filters-card">
      <div className="search-results-v2__filters-card-header">
        <Text strong>
          <FilterOutlined className="search-results-v2__filters-card-icon" />
          Filters
        </Text>
        {hasActiveFilters && (
          <Button type="link" size="small" onClick={onClearAllFilters} icon={<ClearOutlined />}>
            Clear
          </Button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="search-results-v2__filters-card-tags">
          <Space size={4} wrap>
            {Object.entries(selectedFilters).map(([category, values]) =>
              values.map((value) => (
                <Tag
                  key={`${category}-${value}`}
                  closable
                  onClose={() => onFilterChange(category, value, false)}
                  color="blue"
                  className="search-results-v2__filters-card-tag"
                >
                  {value}
                </Tag>
              ))
            )}
          </Space>
        </div>
      )}

      {groupedFacets.length > 0 ? (
        <Collapse ghost expandIconPosition="end" defaultActiveKey={groupedFacets.slice(0, 1).map((g) => g.key)}>
          {groupedFacets.map((group) => (
            <Panel
              header={
                <Space>
                  <span style={{ color: group.color }}>{group.icon}</span>
                  <Text type="secondary" style={{ fontSize: 13 }}>{group.label}</Text>
                </Space>
              }
              key={group.key}
            >
              {group.facets.map((facet) => (
                <div key={facet.key} className="search-results-v2__filters-card-group">
                  <Text strong className="search-results-v2__filters-card-label">
                    {facet.label}
                  </Text>
                  <div className="search-results-v2__filters-card-list">
                    {[...facet.data]
                      .sort((a: FacetBucket, b: FacetBucket) => b.count - a.count)
                      .map((bucket: FacetBucket) => (
                        <div key={bucket.key} className="search-results-v2__filters-card-item">
                          <Checkbox
                            checked={selectedFilters[facet.key]?.includes(bucket.key)}
                            onChange={(e) => onFilterChange(facet.key, bucket.key, e.target.checked)}
                          >
                            <span className="search-results-v2__filters-card-item-text">
                              {bucket.key}{" "}
                              <Text type="secondary" className="search-results-v2__filters-card-item-count">({bucket.count})</Text>
                            </span>
                          </Checkbox>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </Panel>
          ))}
        </Collapse>
      ) : (
        <Text type="secondary" className="search-results-v2__filters-card-empty">No filters available</Text>
      )}
    </Card>
  );
};
