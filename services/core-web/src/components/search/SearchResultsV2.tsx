import React, { useEffect, useState, useMemo, useCallback } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { useLocation, useHistory } from "react-router-dom";
import queryString from "query-string";
import {
  Input,
  Tabs,
  Card,
  Typography,
  Tag,
  Empty,
  Row,
  Col,
  Button,
  Space,
  Spin,
  Checkbox,
  Collapse,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { getSearchResults, getSearchFacets, getSearchTerms } from "@mds/common/redux/selectors/searchSelectors";
import {
  fetchSearchOptions,
  fetchSearchResults,
} from "@mds/common/redux/actionCreators/searchActionCreator";
import { getSearchOptions } from "@mds/common/redux/reducers/searchReducer";
import { getPartyRelationshipTypeHash } from "@mds/common/redux/selectors/staticContentSelectors";
import * as router from "@/constants/routes";
import { ISearchResultList } from "@mds/common/interfaces";
import { MineResultsTable } from "./MineResultsTable";
import { PermitResultsTable } from "./PermitResultsTable";
import { ContactResultsTable } from "./ContactResultsTable";
import { DocumentResultsTable } from "./DocumentResultsTable";

const { Text } = Typography;
const { Panel } = Collapse;

interface FacetBucket {
  key: string;
  count: number;
}

interface SearchFacets {
  // Mine facets
  mine_region?: FacetBucket[];
  mine_classification?: FacetBucket[];
  mine_operation_status?: FacetBucket[];
  mine_tenure?: FacetBucket[];
  mine_commodity?: FacetBucket[];
  has_tsf?: FacetBucket[];
  verified_status?: FacetBucket[];
  // Permit facets
  permit_status?: FacetBucket[];
  is_exploration?: FacetBucket[];
  // Party facets
  party_type?: FacetBucket[];
  // Explosives permit facets
  explosives_permit_status?: FacetBucket[];
  explosives_permit_closed?: FacetBucket[];
  // NOD facets
  nod_type?: FacetBucket[];
  nod_status?: FacetBucket[];
  // NoW facets
  now_application_status?: FacetBucket[];
  now_type?: FacetBucket[];
  // Type facet
  type?: FacetBucket[];
}

interface SearchResultsProps {
  location: { search: string };
  fetchSearchOptions: () => any;
  fetchSearchResults: (query: string, tab?: string, filters?: Record<string, string>) => any;
  searchOptions: any[];
  searchTerms: string[];
  searchResults: ISearchResultList;
  searchFacets: SearchFacets;
  partyRelationshipTypeHash: Record<string, string>;
}

export const SearchResults: React.FC<SearchResultsProps> = (props) => {
  const [isSearching, setIsSearching] = useState(false);
  const [params, setParams] = useState<{ q?: string; t?: string }>({});
  const [searchInputValue, setSearchInputValue] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const history = useHistory();
  const location = useLocation();

  const highlightRegex = useMemo(() => {
    if (!params.q) return null;
    const escapedTerm = params.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    try {
      return new RegExp(escapedTerm, "i");
    } catch {
      return null;
    }
  }, [params.q]);

  // Convert selected filters to API format
  const getFiltersForApi = useCallback((filters: Record<string, string[]>): Record<string, string> => {
    const apiFilters: Record<string, string> = {};
    Object.entries(filters).forEach(([key, values]) => {
      if (values.length > 0) {
        apiFilters[key] = values.join(",");
      }
    });
    return apiFilters;
  }, []);

  // Trigger search with current filters
  const triggerSearch = useCallback((searchTerm: string, searchTypes?: string, filters?: Record<string, string[]>) => {
    if (!searchTerm) return;
    setIsSearching(true);
    const apiFilters = getFiltersForApi(filters || {});
    props.fetchSearchResults(searchTerm, searchTypes, apiFilters);
  }, [props.fetchSearchResults, getFiltersForApi]);

  const handleSearch = useCallback((searchParams: string, resetFilters = true) => {
    const parsedParams = queryString.parse(searchParams);
    const { q, t } = parsedParams;
    if (q) {
      if (resetFilters) {
        setSelectedFilters({});
      }
      setParams({ q: q as string, t: t as string });
      setSearchInputValue(q as string);
      triggerSearch(q as string, t as string, resetFilters ? {} : selectedFilters);
    }
  }, [triggerSearch, selectedFilters]);

  const onSearch = (value: string) => {
    if (value) {
      setSelectedFilters({});
      history.push(router.SEARCH_RESULTS.dynamicRoute({ q: value }));
    }
  };

  const onTabChange = (key: string) => {
    const newParams = { q: params.q || "", t: key === "all" ? null : key };
    history.push(router.SEARCH_RESULTS.dynamicRoute(newParams));
  };

  useEffect(() => {
    if (!props.searchOptions.length) {
      props.fetchSearchOptions();
    }
    handleSearch(props.location.search);
  }, []);

  useEffect(() => {
    handleSearch(props.location.search);
  }, [props.location.search]);

  useEffect(() => {
    if (props.searchResults) {
      setIsSearching(false);
    }
  }, [props.searchResults]);

  // Handle filter change - trigger server-side search
  const handleFilterChange = (category: string, value: string, checked: boolean) => {
    const newFilters = { ...selectedFilters };
    const current = newFilters[category] || [];
    
    if (checked) {
      newFilters[category] = [...current, value];
    } else {
      const updated = current.filter((v) => v !== value);
      if (updated.length === 0) {
        delete newFilters[category];
      } else {
        newFilters[category] = updated;
      }
    }
    
    setSelectedFilters(newFilters);
    
    // Trigger server-side search with new filters
    if (params.q) {
      triggerSearch(params.q, params.t, newFilters);
    }
  };

  const clearAllFilters = () => {
    setSelectedFilters({});
    if (params.q) {
      triggerSearch(params.q, params.t, {});
    }
  };

  const hasActiveFilters = Object.keys(selectedFilters).length > 0;

  // Get results directly from API (server-side filtered)
  const mines = props.searchResults.mine || [];
  const parties = props.searchResults.party || [];
  const permits = props.searchResults.permit || [];
  const mineDocuments = props.searchResults.mine_documents || [];
  const permitDocuments = props.searchResults.permit_documents || [];

  // Transform results to format expected by table components
  const mineResults = mines.map((item: any) => item.result);
  const partyResults = parties.map((item: any) => item.result);
  const permitResults = permits.map((item: any) => item.result);
  const documentResults = [...mineDocuments, ...permitDocuments].map((item: any) => item.result);

  const totalResults = mines.length + parties.length + permits.length + mineDocuments.length + permitDocuments.length;

  // Facet configuration from ES aggregations
  const facetConfig = [
    // Mine facets
    { key: "mine_region", label: "Mine Region", data: props.searchFacets?.mine_region || [] },
    { key: "mine_classification", label: "Classification", data: props.searchFacets?.mine_classification || [] },
    { key: "mine_operation_status", label: "Operation Status", data: props.searchFacets?.mine_operation_status || [] },
    { key: "mine_tenure", label: "Tenure Type", data: props.searchFacets?.mine_tenure || [] },
    { key: "mine_commodity", label: "Commodity", data: props.searchFacets?.mine_commodity || [] },
    { key: "has_tsf", label: "Tailings Storage Facility", data: props.searchFacets?.has_tsf || [] },
    { key: "verified_status", label: "Verification Status", data: props.searchFacets?.verified_status || [] },
    // Permit facets
    { key: "permit_status", label: "Permit Status", data: props.searchFacets?.permit_status || [] },
    { key: "is_exploration", label: "Exploration", data: props.searchFacets?.is_exploration || [] },
    // Party facets
    { key: "party_type", label: "Contact Type", data: props.searchFacets?.party_type || [] },
    // Explosives permit facets
    { key: "explosives_permit_status", label: "Explosives Status", data: props.searchFacets?.explosives_permit_status || [] },
    { key: "explosives_permit_closed", label: "Explosives Closed", data: props.searchFacets?.explosives_permit_closed || [] },
    // NOD facets
    { key: "nod_type", label: "NOD Type", data: props.searchFacets?.nod_type || [] },
    { key: "nod_status", label: "NOD Status", data: props.searchFacets?.nod_status || [] },
    // NoW facets
    { key: "now_application_status", label: "NoW Status", data: props.searchFacets?.now_application_status || [] },
    { key: "now_type", label: "NoW Type", data: props.searchFacets?.now_type || [] },
  ].filter((f) => f.data.length > 0);

  const renderFilters = () => (
    <Card size="small" style={{ marginBottom: 16, position: "sticky", top: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Text strong>
          <FilterOutlined style={{ marginRight: 8 }} />
          Filters
        </Text>
        {hasActiveFilters && (
          <Button type="link" size="small" onClick={clearAllFilters} icon={<ClearOutlined />}>
            Clear
          </Button>
        )}
      </div>

      {hasActiveFilters && (
        <div style={{ marginBottom: 12 }}>
          <Space size={4} wrap>
            {Object.entries(selectedFilters).map(([category, values]) =>
              values.map((value) => (
                <Tag
                  key={`${category}-${value}`}
                  closable
                  onClose={() => handleFilterChange(category, value, false)}
                  color="blue"
                  style={{ margin: 0 }}
                >
                  {value}
                </Tag>
              ))
            )}
          </Space>
        </div>
      )}

      {facetConfig.length > 0 ? (
        <Collapse ghost expandIconPosition="end" defaultActiveKey={facetConfig.slice(0, 2).map((f) => f.key)}>
          {facetConfig.map((facet) => (
            <Panel header={<Text type="secondary" style={{ fontSize: 13 }}>{facet.label}</Text>} key={facet.key}>
              <div style={{ maxHeight: 200, overflowY: "auto" }}>
                {facet.data
                  .sort((a, b) => b.count - a.count)
                  .map((bucket) => (
                    <div key={bucket.key} style={{ marginBottom: 4 }}>
                      <Checkbox
                        checked={selectedFilters[facet.key]?.includes(bucket.key)}
                        onChange={(e) => handleFilterChange(facet.key, bucket.key, e.target.checked)}
                      >
                        <span style={{ fontSize: 13 }}>
                          {bucket.key}{" "}
                          <Text type="secondary" style={{ fontSize: 11 }}>({bucket.count})</Text>
                        </span>
                      </Checkbox>
                    </div>
                  ))}
              </div>
            </Panel>
          ))}
        </Collapse>
      ) : (
        <Text type="secondary" style={{ fontSize: 12 }}>No filters available</Text>
      )}
    </Card>
  );

  const tabItems = [
    {
      key: "all",
      label: `All (${totalResults})`,
      children: (
        <>
          {mineResults.length > 0 && (
            <MineResultsTable
              header={`Mines (${mineResults.length})`}
              highlightRegex={highlightRegex}
              query={params.q || ""}
              searchResults={mineResults}
              showAdvancedLookup={false}
            />
          )}
          {partyResults.length > 0 && (
            <ContactResultsTable
              header={`Contacts (${partyResults.length})`}
              highlightRegex={highlightRegex}
              query={params.q || ""}
              searchResults={partyResults}
              partyRelationshipTypeHash={props.partyRelationshipTypeHash}
              showAdvancedLookup={false}
            />
          )}
          {permitResults.length > 0 && (
            <PermitResultsTable
              header={`Permits (${permitResults.length})`}
              highlightRegex={highlightRegex}
              searchResults={permitResults}
            />
          )}
          {documentResults.length > 0 && (
            <DocumentResultsTable
              header={`Documents (${documentResults.length})`}
              highlightRegex={highlightRegex}
              searchResults={documentResults}
            />
          )}
        </>
      ),
    },
    {
      key: "mine",
      label: `Mines (${mines.length})`,
      children: (
        <MineResultsTable
          header=""
          highlightRegex={highlightRegex}
          query={params.q || ""}
          searchResults={mineResults}
          showAdvancedLookup={true}
        />
      ),
    },
    {
      key: "party",
      label: `Contacts (${parties.length})`,
      children: (
        <ContactResultsTable
          header=""
          highlightRegex={highlightRegex}
          query={params.q || ""}
          searchResults={partyResults}
          partyRelationshipTypeHash={props.partyRelationshipTypeHash}
          showAdvancedLookup={true}
        />
      ),
    },
    {
      key: "permit",
      label: `Permits (${permits.length})`,
      children: (
        <PermitResultsTable
          header=""
          highlightRegex={highlightRegex}
          searchResults={permitResults}
        />
      ),
    },
    {
      key: "document",
      label: `Documents (${documentResults.length})`,
      children: (
        <DocumentResultsTable
          header=""
          highlightRegex={highlightRegex}
          searchResults={documentResults}
        />
      ),
    },
  ];

  const activeTab = params.t || "all";

  return (
    <div className="search-results-page">
      <div className="search-results-page__header">
        <Row justify="center">
          <Col xs={22} lg={18}>
            <div style={{ marginBottom: 24 }}>
              <Input.Search
                placeholder="Search for mines, contacts, permits..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                value={searchInputValue}
                onChange={(e) => setSearchInputValue(e.target.value)}
                onSearch={onSearch}
                style={{ maxWidth: 600 }}
              />
            </div>
          </Col>
        </Row>
      </div>

      <div className="search-results-page__content">
        <Row justify="center">
          <Col xs={24} lg={20} xl={18}>
            {isSearching ? (
              <div style={{ textAlign: "center", padding: 48 }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">Searching...</Text>
                </div>
              </div>
            ) : totalResults === 0 && !hasActiveFilters ? (
              <Empty
                description={<span>No results found for "<strong>{params.q}</strong>"</span>}
                style={{ padding: 48 }}
              >
                <Button type="primary" onClick={() => history.push(router.HOME_PAGE.route)}>
                  Back to Home
                </Button>
              </Empty>
            ) : totalResults === 0 && hasActiveFilters ? (
              <Row gutter={24}>
                <Col xs={24} md={7} lg={6}>
                  {renderFilters()}
                </Col>
                <Col xs={24} md={17} lg={18}>
                  <Empty
                    description={<span>No results match your filters</span>}
                    style={{ padding: 48 }}
                  >
                    <Button onClick={clearAllFilters}>Clear Filters</Button>
                  </Empty>
                </Col>
              </Row>
            ) : (
              <Row gutter={24}>
                <Col xs={24} md={7} lg={6}>
                  {renderFilters()}
                </Col>
                <Col xs={24} md={17} lg={18}>
                  <div style={{ marginBottom: 16 }}>
                    <Text type="secondary">
                      Showing <strong>{totalResults}</strong> results for "<strong>{params.q}</strong>"
                      {hasActiveFilters && " (filtered)"}
                    </Text>
                  </div>
                  <Tabs activeKey={activeTab} onChange={onTabChange} items={tabItems} size="middle" />
                </Col>
              </Row>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
};

const mapStateToProps = (state: any) => ({
  searchOptions: getSearchOptions(state),
  searchResults: getSearchResults(state),
  searchFacets: getSearchFacets(state),
  searchTerms: getSearchTerms(state),
  partyRelationshipTypeHash: getPartyRelationshipTypeHash(state),
});

const mapDispatchToProps = (dispatch: any) =>
  bindActionCreators(
    {
      fetchSearchOptions,
      fetchSearchResults,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(SearchResults);
