import React from "react";
import { Row, Col, Spin, Typography } from "antd";
import { useSearchResults } from "./useSearchResults";
import { SearchHeader } from "./SearchHeader";
import { SearchFiltersPanel } from "./SearchFiltersPanel";
import { SearchResultsTabs } from "./SearchResultsTabs";
import { PageTracker } from "@common/utils/trackers";

const { Text } = Typography;

export const SearchResults: React.FC = () => {
  const {
    isSearching,
    params,
    searchInputValue,
    setSearchInputValue,
    selectedFilters,
    searchFacets,
    partyRelationshipTypeHash,
    highlightRegex,
    onSearch,
    onTabChange,
    handleFilterChange,
    clearAllFilters,
    hasActiveFilters,
    results,
  } = useSearchResults();

  const activeTab = params.t || "all";

  return (
    <div className="landing-page search-results-page">
      <PageTracker title="Search Results" />
      <SearchHeader
        searchInputValue={searchInputValue}
        onSearchInputChange={setSearchInputValue}
        onSearch={onSearch}
      />

      <div className="landing-page__content">
        <div className="tab__content">
          {isSearching ? (
            <div className="search-results-v2__loading">
              <Spin size="large" />
              <div className="search-results-v2__loading-text">
                <Text type="secondary">Searching...</Text>
              </div>
            </div>
          ) : (
            <Row gutter={24}>
              <Col xs={24} md={7} lg={6}>
                <SearchFiltersPanel
                  searchFacets={searchFacets}
                  selectedFilters={selectedFilters}
                  hasActiveFilters={hasActiveFilters}
                  onFilterChange={handleFilterChange}
                  onClearAllFilters={clearAllFilters}
                />
              </Col>
              <Col xs={24} md={17} lg={18}>
                <div className="search-results-v2__result-count">
                  <Text type="secondary">
                    {results.totalResults === 0 ? (
                      params.q === "*" ? (
                        <>No results found{hasActiveFilters && " (filtered)"}</>
                      ) : (
                        <>No results for "<strong>{params.q}</strong>"{hasActiveFilters && " (filtered)"}</>
                      )
                    ) : (
                      params.q === "*" ? (
                        <>Showing <strong>{results.totalResults}</strong> results{hasActiveFilters && " (filtered)"}</>
                      ) : (
                        <>Showing <strong>{results.totalResults}</strong> results for "<strong>{params.q}</strong>"{hasActiveFilters && " (filtered)"}</>
                      )
                    )}
                  </Text>
                </div>
                <SearchResultsTabs
                  activeTab={activeTab}
                  onTabChange={onTabChange}
                  query={params.q || ""}
                  highlightRegex={highlightRegex}
                  partyRelationshipTypeHash={partyRelationshipTypeHash}
                  results={results}
                />
              </Col>
            </Row>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
