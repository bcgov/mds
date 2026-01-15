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
  EnvironmentOutlined,
  UserOutlined,
  BankOutlined,
  FileProtectOutlined,
  AlertOutlined,
  FileSearchOutlined,
  ExceptionOutlined,
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
import { GenericResultsTable } from "./GenericResultsTable";
import { PageTracker } from "@common/utils/trackers";
import "@/styles/components/SearchResults.scss";

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



  // Map tab keys to backend search types and apply automatic filters
  const mapTabToSearchType = (tabKey: string | undefined, currentFilters: Record<string, string[]>): { types: string | undefined; filters: Record<string, string[]> } => {
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
    
    return { 
      types: tabToTypeMap[tabKey],
      filters: newFilters
    };
  };

  // Trigger search with current filters
  const triggerSearch = useCallback((searchTerm: string, searchTypes?: string, filters?: Record<string, string[]>) => {
    if (!searchTerm) return;
    setIsSearching(true);
    const { types, filters: enhancedFilters } = mapTabToSearchType(searchTypes, filters || {});
    const apiFilters = getFiltersForApi(enhancedFilters);
    props.fetchSearchResults(searchTerm, types, apiFilters);
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
  const explosivesPermits = props.searchResults.explosives_permit || [];
  const nowApplications = props.searchResults.now_application || [];
  const nods = props.searchResults.notice_of_departure || [];

  // Transform results to format expected by table components
  const mineResults = mines.map((item: any) => item.result);
  const partyResults = parties.map((item: any) => item.result);
  
  // Separate people and organizations
  const peopleResults = partyResults.filter((p: any) => p.party_type_code === "PER");
  const organizationResults = partyResults.filter((p: any) => p.party_type_code === "ORG");
  
  const permitResults = permits.map((item: any) => item.result);
  const documentResults = [...mineDocuments, ...permitDocuments].map((item: any) => item.result);
  const explosivesPermitResults = explosivesPermits.map((item: any) => item.result);
  const nowApplicationResults = nowApplications.map((item: any) => item.result);
  const nodResults = nods.map((item: any) => item.result);

  const totalResults = mines.length + parties.length + permits.length + mineDocuments.length + permitDocuments.length + 
                       explosivesPermits.length + nowApplications.length + nods.length;

  // Build grouped facets from API facets
  const groupedFacets = useMemo(() => {
    return FACET_GROUPS.map((group) => {
      const facets = group.facets
        .map((facetKey) => ({
          key: facetKey,
          label: FACET_LABELS[facetKey] || facetKey,
          data: (props.searchFacets as any)?.[facetKey] || [],
        }))
        .filter((f) => f.data.length > 0);

      return {
        ...group,
        facets: facets,
      };
    }).filter((group) => group.facets.length > 0);
  }, [props.searchFacets]);

  const renderFilters = () => (
    <Card size="small" style={{ marginBottom: 16 }}>
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
                <div key={facet.key} style={{ marginBottom: 8 }}>
                  <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                    {facet.label}
                  </Text>
                  <div style={{ maxHeight: 200, overflowY: "auto", paddingLeft: 8 }}>
                    {facet.data
                      .sort((a: FacetBucket, b: FacetBucket) => b.count - a.count)
                      .map((bucket: FacetBucket) => (
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
                </div>
              ))}
            </Panel>
          ))}
        </Collapse>
      ) : (
        <Text type="secondary" style={{ fontSize: 12 }}>No filters available</Text>
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
      style={{ padding: "40px 0" }}
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
              partyRelationshipTypeHash={props.partyRelationshipTypeHash}
              showAdvancedLookup={false}
            />
          )}
          {organizationResults.length > 0 && (
            <ContactResultsTable
              header={`Organizations (${organizationResults.length})`}
              highlightRegex={highlightRegex}
              query={params.q || ""}
              searchResults={organizationResults}
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
          partyRelationshipTypeHash={props.partyRelationshipTypeHash}
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
          partyRelationshipTypeHash={props.partyRelationshipTypeHash}
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
            <div style={{ textAlign: "center", padding: 48 }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">Searching...</Text>
              </div>
            </div>
          ) : (
            <Row gutter={24}>
              <Col xs={24} md={7} lg={6}>
                {renderFilters()}
              </Col>
              <Col xs={24} md={17} lg={18}>
                <div style={{ marginBottom: 16 }}>
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
