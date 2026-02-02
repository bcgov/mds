import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
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
  EnvironmentOutlined,
  UserOutlined,
  FileProtectOutlined,
  AlertOutlined,
  FileSearchOutlined,
  ExceptionOutlined,
} from "@ant-design/icons";
import {
  selectSearchResults,
  selectSearchFacets,
  selectSearchTerms,
  selectSearchOptions,
  fetchSearchOptions,
  fetchSearchResults,
} from "@mds/common/redux/slices/searchSlice";
import { getPartyRelationshipTypeHash } from "@mds/common/redux/selectors/staticContentSelectors";
import * as router from "@/constants/routes";
import { MineResultsTable } from "./MineResultsTable";
import { PermitResultsTable } from "./PermitResultsTable";
import { ContactResultsTable } from "./ContactResultsTable";
import { DocumentResultsTable } from "./DocumentResultsTable";
import { GenericResultsTable } from "./GenericResultsTable";
import { PageTracker } from "@common/utils/trackers";

const { Text } = Typography;
const { Panel } = Collapse;

// Facet groups organized by entity type
const FACET_GROUPS = [
  {
    key: "mine",
    label: "Mine Filters",
    icon: <EnvironmentOutlined />,
    color: "#2e7d32",
    facets: ["mine_region", "mine_classification", "mine_operation_status", "mine_tenure", "mine_commodity", "has_tsf", "verified_status"]
  },
  {
    key: "permit",
    label: "Permit Filters",
    icon: <FileProtectOutlined />,
    color: "#e65100",
    facets: ["permit_status", "is_exploration"]
  },
  {
    key: "party",
    label: "Contact Filters",
    icon: <UserOutlined />,
    color: "#1565c0",
    facets: ["party_type"]
  },
  {
    key: "explosives_permit",
    label: "Explosives Filters",
    icon: <AlertOutlined />,
    color: "#d32f2f",
    facets: ["explosives_permit_status", "explosives_permit_closed"]
  },
  {
    key: "now_application",
    label: "NoW Filters",
    icon: <FileSearchOutlined />,
    color: "#0288d1",
    facets: ["now_application_status", "now_type"]
  },
  {
    key: "nod",
    label: "NOD Filters",
    icon: <ExceptionOutlined />,
    color: "#7b1fa2",
    facets: ["nod_type", "nod_status"]
  },
];

// Facet display labels
const FACET_LABELS: Record<string, string> = {
  mine_region: "Region",
  mine_classification: "Classification",
  mine_operation_status: "Operation Status",
  mine_tenure: "Tenure Type",
  mine_commodity: "Commodity",
  has_tsf: "Tailings Storage Facility",
  verified_status: "Verification Status",
  permit_status: "Status",
  is_exploration: "Exploration",
  party_type: "Type",
  explosives_permit_status: "Status",
  explosives_permit_closed: "Status",
  nod_type: "Type",
  nod_status: "Status",
  now_application_status: "Status",
  now_type: "Type",
};

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

export const SearchResults: React.FC = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [params, setParams] = useState<{ q?: string; t?: string }>({});
  const [searchInputValue, setSearchInputValue] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();

  // Redux selectors
  const searchOptions = useSelector(selectSearchOptions);
  const searchResults = useSelector(selectSearchResults);
  const searchFacets = useSelector(selectSearchFacets);
  const partyRelationshipTypeHash = useSelector(getPartyRelationshipTypeHash);

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



  // Map tab keys to backend search types and apply automatic filters
  const mapTabToSearchType = useCallback((tabKey: string | undefined, currentFilters: Record<string, string[]>): { types: string[] | undefined; filters: Record<string, string[]> } => {
    if (!tabKey || tabKey === "all") return { types: undefined, filters: currentFilters };

    const tabToTypeMap: Record<string, string> = {
      "mine": "mine",
      "people": "party",
      "organization": "party",
      "permit": "permit",
      "explosives_permit": "explosives_permit",
      "now_application": "now_application",
      "notice_of_departure": "notice_of_departure",
      "document": "mine_documents,permit_documents",
    };

    const newFilters = { ...currentFilters };

    // Add automatic party_type filter for people/organization tabs
    if (tabKey === "people") {
      newFilters.party_type = ["Person"];
    } else if (tabKey === "organization") {
      newFilters.party_type = ["Organization"];
    }

    const typeString = tabToTypeMap[tabKey];
    return {
      types: typeString ? typeString.split(",") : undefined,
      filters: newFilters
    };
  }, []);

  // Trigger search with current filters
  const triggerSearch = useCallback((searchTerm: string, searchTypes?: string, filters?: Record<string, string[]>) => {
    if (!searchTerm) return;
    setIsSearching(true);
    const { types, filters: enhancedFilters } = mapTabToSearchType(searchTypes, filters || {});
    const apiFilters = getFiltersForApi(enhancedFilters);
    dispatch(fetchSearchResults({ searchTerm, searchTypes: types, filters: apiFilters }));
  }, [dispatch, getFiltersForApi, mapTabToSearchType]);

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
    if (!searchOptions.length) {
      dispatch(fetchSearchOptions(undefined));
    }
  }, [searchOptions.length, dispatch]);

  useEffect(() => {
    const parsedParams = queryString.parse(location.search);
    const { q, t } = parsedParams;
    if (q) {
      setParams({ q: q as string, t: t as string });
      setSearchInputValue(q as string);
      setIsSearching(true);
      const { types, filters: enhancedFilters } = mapTabToSearchType(t as string, {});
      const apiFilters = getFiltersForApi(enhancedFilters);
      dispatch(fetchSearchResults({ searchTerm: q as string, searchTypes: types, filters: apiFilters }));
    }
  }, [location.search, dispatch, mapTabToSearchType, getFiltersForApi]);

  useEffect(() => {
    if (searchResults) {
      setIsSearching(false);
    }
  }, [searchResults]);

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
  const mines = searchResults?.mine || [];
  const parties = searchResults?.party || [];
  const permits = searchResults?.permit || [];
  const mineDocuments = searchResults?.mine_documents || [];
  const permitDocuments = searchResults?.permit_documents || [];
  const explosivesPermits = searchResults?.explosives_permit || [];
  const nowApplications = searchResults?.now_application || [];
  const nods = searchResults?.notice_of_departure || [];

  // Transform results to format expected by table components
  const mineResults = mines.map((item: any) => item.result).filter(Boolean);
  const partyResults = parties.map((item: any) => item.result).filter(Boolean);

  // Separate people and organizations
  const peopleResults = partyResults.filter((p: any) => p?.party_type_code === "PER");
  const organizationResults = partyResults.filter((p: any) => p?.party_type_code === "ORG");

  const permitResults = permits.map((item: any) => item.result).filter(Boolean);
  const documentResults = [...mineDocuments, ...permitDocuments].map((item: any) => item.result).filter(Boolean);
  const explosivesPermitResults = explosivesPermits.map((item: any) => item.result).filter(Boolean);
  const nowApplicationResults = nowApplications.map((item: any) => item.result).filter(Boolean);
  const nodResults = nods.map((item: any) => item.result).filter(Boolean);

  const totalResults = mines.length + parties.length + permits.length + mineDocuments.length + permitDocuments.length +
    explosivesPermits.length + nowApplications.length + nods.length;

  // Build grouped facets from API facets
  const groupedFacets = useMemo(() => {
    return FACET_GROUPS.map((group) => {
      const facets = group.facets
        .map((facetKey) => ({
          key: facetKey,
          label: FACET_LABELS[facetKey] || facetKey,
          data: searchFacets?.[facetKey] || [],
        }))
        .filter((f) => f.data.length > 0);

      return {
        ...group,
        facets: facets,
      };
    }).filter((group) => group.facets.length > 0);
  }, [searchFacets]);

  const renderFilters = () => (
    <Card size="small" className="search-results-v2__filters-card">
      <div className="search-results-v2__filters-card-header">
        <Text strong>
          <FilterOutlined className="search-results-v2__filters-card-icon" />
          Filters
        </Text>
        {hasActiveFilters && (
          <Button type="link" size="small" onClick={clearAllFilters} icon={<ClearOutlined />}>
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
                  onClose={() => handleFilterChange(category, value, false)}
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
                            onChange={(e) => handleFilterChange(facet.key, bucket.key, e.target.checked)}
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

  const renderEmptyState = () => (
    <Empty
      description={
        <span>
          No results in this category
        </span>
      }
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      className="search-results-v2__empty-state"
    />
  );

  const tabItems = [
    {
      key: "all",
      label: `All (${totalResults})`,
      children: totalResults === 0 ? renderEmptyState() : (
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
          {peopleResults.length > 0 && (
            <ContactResultsTable
              header={`People (${peopleResults.length})`}
              highlightRegex={highlightRegex}
              query={params.q || ""}
              searchResults={peopleResults}
              partyRelationshipTypeHash={partyRelationshipTypeHash}
              showAdvancedLookup={false}
            />
          )}
          {organizationResults.length > 0 && (
            <ContactResultsTable
              header={`Organizations (${organizationResults.length})`}
              highlightRegex={highlightRegex}
              query={params.q || ""}
              searchResults={organizationResults}
              partyRelationshipTypeHash={partyRelationshipTypeHash}
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
          {explosivesPermitResults.length > 0 && (
            <GenericResultsTable
              header={`Explosives Permits (${explosivesPermitResults.length})`}
              searchResults={explosivesPermitResults}
              highlightRegex={highlightRegex}
              getRecordKey={(record: any) => record.explosives_permit_guid}
              columns={[
                { title: "Application #", dataIndex: "application_number", key: "application_number" },
                { title: "Status", dataIndex: "application_status", key: "application_status" },
                { title: "Mine", dataIndex: "mine_name", key: "mine_name", link: (record: any) => router.MINE_PERMITS.dynamicRoute(record.mine_guid) },
                { title: "Closed", dataIndex: "is_closed", key: "is_closed", customRender: (text: boolean) => text ? "Yes" : "No" },
              ]}
            />
          )}
          {nowApplicationResults.length > 0 && (
            <GenericResultsTable
              header={`Notices of Work (${nowApplicationResults.length})`}
              searchResults={nowApplicationResults}
              highlightRegex={highlightRegex}
              getRecordKey={(record: any) => record.now_application_guid}
              columns={[
                { title: "NoW #", dataIndex: "now_number", key: "now_number", link: (record: any) => router.NOTICE_OF_WORK_APPLICATION.dynamicRoute(record.now_application_guid, "verification") },
                { title: "Status", dataIndex: "now_application_status_code", key: "status" },
                { title: "Type", dataIndex: "notice_of_work_type_code", key: "type" },
                { title: "Mine", dataIndex: "mine_name", key: "mine_name", link: (record: any) => router.MINE_GENERAL.dynamicRoute(record.mine_guid) },
              ]}
            />
          )}
          {nodResults.length > 0 && (
            <GenericResultsTable
              header={`Notices of Departure (${nodResults.length})`}
              searchResults={nodResults}
              highlightRegex={highlightRegex}
              getRecordKey={(record: any) => record.nod_guid}
              columns={[
                { title: "NOD #", dataIndex: "nod_no", key: "nod_no", link: (record: any) => router.NOTICE_OF_DEPARTURE.dynamicRoute(record.mine_guid, record.nod_guid) },
                { title: "Title", dataIndex: "nod_title", key: "nod_title" },
                { title: "Type", dataIndex: "nod_type", key: "nod_type" },
                { title: "Status", dataIndex: "nod_status", key: "nod_status" },
                { title: "Mine", dataIndex: "mine_name", key: "mine_name", link: (record: any) => router.MINE_GENERAL.dynamicRoute(record.mine_guid) },
              ]}
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
      children: mineResults.length === 0 ? renderEmptyState() : (
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
      key: "people",
      label: `People (${peopleResults.length})`,
      children: peopleResults.length === 0 ? renderEmptyState() : (
        <ContactResultsTable
          header=""
          highlightRegex={highlightRegex}
          query={params.q || ""}
          searchResults={peopleResults}
          partyRelationshipTypeHash={partyRelationshipTypeHash}
          showAdvancedLookup={true}
        />
      ),
    },
    {
      key: "organization",
      label: `Organizations (${organizationResults.length})`,
      children: organizationResults.length === 0 ? renderEmptyState() : (
        <ContactResultsTable
          header=""
          highlightRegex={highlightRegex}
          query={params.q || ""}
          searchResults={organizationResults}
          partyRelationshipTypeHash={partyRelationshipTypeHash}
          showAdvancedLookup={true}
        />
      ),
    },
    {
      key: "permit",
      label: `Permits (${permits.length})`,
      children: permitResults.length === 0 ? renderEmptyState() : (
        <PermitResultsTable
          header=""
          highlightRegex={highlightRegex}
          searchResults={permitResults}
        />
      ),
    },
    {
      key: "explosives_permit",
      label: `Explosives (${explosivesPermits.length})`,
      children: explosivesPermitResults.length === 0 ? renderEmptyState() : (
        <GenericResultsTable
          header=""
          searchResults={explosivesPermitResults}
          highlightRegex={highlightRegex}
          getRecordKey={(record: any) => record.explosives_permit_guid}
          columns={[
            { title: "Application #", dataIndex: "application_number", key: "application_number" },
            { title: "Status", dataIndex: "application_status", key: "application_status" },
            { title: "Mine", dataIndex: "mine_name", key: "mine_name", link: (record: any) => router.MINE_PERMITS.dynamicRoute(record.mine_guid) },
            { title: "Closed", dataIndex: "is_closed", key: "is_closed", customRender: (text: boolean) => text ? "Yes" : "No" },
          ]}
        />
      ),
    },
    {
      key: "now_application",
      label: `NoW (${nowApplications.length})`,
      children: nowApplicationResults.length === 0 ? renderEmptyState() : (
        <GenericResultsTable
          header=""
          searchResults={nowApplicationResults}
          highlightRegex={highlightRegex}
          getRecordKey={(record: any) => record.now_application_guid}
          columns={[
            { title: "NoW #", dataIndex: "now_number", key: "now_number", link: (record: any) => router.NOTICE_OF_WORK_APPLICATION.dynamicRoute(record.now_application_guid, "verification") },
            { title: "Status", dataIndex: "now_application_status_code", key: "status" },
            { title: "Type", dataIndex: "notice_of_work_type_code", key: "type" },
            { title: "Mine", dataIndex: "mine_name", key: "mine_name", link: (record: any) => router.MINE_GENERAL.dynamicRoute(record.mine_guid) },
          ]}
        />
      ),
    },
    {
      key: "notice_of_departure",
      label: `NODs (${nods.length})`,
      children: nodResults.length === 0 ? renderEmptyState() : (
        <GenericResultsTable
          header=""
          searchResults={nodResults}
          highlightRegex={highlightRegex}
          getRecordKey={(record: any) => record.nod_guid}
          columns={[
            { title: "NOD #", dataIndex: "nod_no", key: "nod_no", link: (record: any) => router.NOTICE_OF_DEPARTURE.dynamicRoute(record.mine_guid, record.nod_guid) },
            { title: "Title", dataIndex: "nod_title", key: "nod_title" },
            { title: "Type", dataIndex: "nod_type", key: "nod_type" },
            { title: "Status", dataIndex: "nod_status", key: "nod_status" },
            { title: "Mine", dataIndex: "mine_name", key: "mine_name", link: (record: any) => router.MINE_GENERAL.dynamicRoute(record.mine_guid) },
          ]}
        />
      ),
    },
    {
      key: "document",
      label: `Documents (${documentResults.length})`,
      children: documentResults.length === 0 ? renderEmptyState() : (
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
    <div className="landing-page search-results-page">
      <PageTracker title="Search Results" />
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
            onChange={(e) => setSearchInputValue(e.target.value)}
            onSearch={onSearch}
          />
        </div>
      </div>

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
                {renderFilters()}
              </Col>
              <Col xs={24} md={17} lg={18}>
                <div className="search-results-v2__result-count">
                  <Text type="secondary">
                    {totalResults === 0 ? (
                      <>No results for "<strong>{params.q}</strong>"{hasActiveFilters && " (filtered)"}</>
                    ) : (
                      <>Showing <strong>{totalResults}</strong> results for "<strong>{params.q}</strong>"{hasActiveFilters && " (filtered)"}</>
                    )}
                  </Text>
                </div>
                <Tabs
                  activeKey={activeTab}
                  onChange={onTabChange}
                  items={tabItems}
                  size="large"
                  animated={{ inkBar: false, tabPane: false }}
                  className="search-results-tabs"
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
