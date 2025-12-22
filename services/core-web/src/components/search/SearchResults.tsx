import React, { useEffect, useState, useMemo } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { useLocation, useHistory, Link } from "react-router-dom";
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
  Checkbox,
  Collapse,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  FileTextOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  FileProtectOutlined,
  ArrowRightOutlined,
  EyeOutlined,
  FilterOutlined,
  CloseOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { getSearchResults, getSearchFacets, getSearchTerms } from "@mds/common/redux/selectors/searchSelectors";
import {
  fetchSearchOptions,
  fetchSearchResults,
} from "@mds/common/redux/actionCreators/searchActionCreator";
import { getSearchOptions } from "@mds/common/redux/reducers/searchReducer";
import * as router from "@/constants/routes";
import Highlight from "react-highlighter";
import DocumentLink from "@mds/common/components/documents/DocumentLink";
import { ISearchResultList } from "@mds/common/interfaces";
import { formatDate } from "@common/utils/helpers";

const { Title, Text } = Typography;
const { Panel } = Collapse;

interface FacetBucket {
  key: string;
  count: number;
}

interface SearchFacets {
  mine_region: FacetBucket[];
  mine_classification: FacetBucket[];
  mine_operation_status: FacetBucket[];
  mine_tenure: FacetBucket[];
  mine_commodity: FacetBucket[];
  has_tsf: FacetBucket[];
  verified_status: FacetBucket[];
  permit_status: FacetBucket[];
  type: FacetBucket[];
}

interface SearchResultsProps {
  location: { search: string };
  history: { push: (path: string) => void };
  fetchSearchOptions: () => any;
  fetchSearchResults: (query: string, tab?: string) => any;
  searchOptions: any[];
  searchTerms: string[];
  searchResults: ISearchResultList;
  searchFacets: SearchFacets;
  hideLoadingIndicator?: boolean;
}

type PropsFromRedux = SearchResultsProps;

const StatusTag = ({ status }: { status: string | string[] }) => {
  if (!status) return null;
  const statusText = Array.isArray(status) ? status.join(", ") : status;
  let color = "default";
  const lowerStatus = statusText.toLowerCase();
  if (
    lowerStatus.includes("operating") ||
    lowerStatus.includes("open") ||
    lowerStatus.includes("active")
  ) {
    color = "success";
  } else if (lowerStatus.includes("closed")) {
    color = "error";
  } else if (lowerStatus.includes("care") || lowerStatus.includes("maintenance")) {
    color = "warning";
  }
  return <Tag color={color}>{statusText}</Tag>;
};

const SearchSkeleton = () => (
  <div className="search-skeleton">
    {[1, 2, 3, 4].map((i) => (
      <Card key={i} className="search-result-card" style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div
            className="skeleton-pulse"
            style={{ width: 48, height: 48, borderRadius: 12 }}
          />
          <div style={{ flex: 1 }}>
            <div
              className="skeleton-pulse"
              style={{ height: 18, width: "60%", marginBottom: 8, borderRadius: 4 }}
            />
            <div
              className="skeleton-pulse"
              style={{ height: 14, width: "40%", borderRadius: 4 }}
            />
          </div>
        </div>
      </Card>
    ))}
  </div>
);

const ResultCard = ({
  icon,
  iconClass,
  title,
  link,
  children,
  actions,
  highlightRegex,
}: {
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  link: string;
  children: React.ReactNode;
  actions?: React.ReactNode[];
  highlightRegex?: RegExp | null;
}) => (
  <Card hoverable className="search-result-card">
    <Row gutter={16} align="middle" wrap={false}>
      <Col flex="none">
        <div className={`card-icon ${iconClass}`}>{icon}</div>
      </Col>
      <Col flex="auto" style={{ minWidth: 0 }}>
        <Link to={link} className="card-title">
          {highlightRegex ? <Highlight search={highlightRegex}>{title ?? ""}</Highlight> : title}
        </Link>
        <div className="card-meta">{children}</div>
      </Col>
      <Col flex="none">
        <Tooltip title="View details">
          <Link to={link}>
            <Button type="text" icon={<ArrowRightOutlined />} />
          </Link>
        </Tooltip>
      </Col>
    </Row>
    {actions && actions.length > 0 && (
      <div className="card-actions">
        {actions.map((action, index) => (
          <React.Fragment key={index}>{action}</React.Fragment>
        ))}
      </div>
    )}
  </Card>
);

export const SearchResults: React.FC<PropsFromRedux> = (props) => {
  const [isSearching, setIsSearching] = useState(false);
  const [params, setParams] = useState<{ [key: string]: string }>({});
  const [searchInputValue, setSearchInputValue] = useState("");
  const history = useHistory();
  const location = useLocation();
  const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: string[] }>({});

  useEffect(() => {
    setSelectedFilters({});
  }, [params.q]);

  const handleFilterChange = (category: string, value: string, checked: boolean) => {
    setSelectedFilters((prev) => {
      const current = prev[category] || [];
      if (checked) {
        return { ...prev, [category]: [...current, value] };
      } else {
        const newCategory = current.filter((v) => v !== value);
        if (newCategory.length === 0) {
          const { [category]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [category]: newCategory };
      }
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters({});
  };

  const removeFilter = (category: string, value: string) => {
    handleFilterChange(category, value, false);
  };

  const highlightRegex = useMemo(() => {
    if (!params.q) return null;
    const escapedTerm = params.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    try {
      return new RegExp(escapedTerm, "i");
    } catch (e) {
      return null;
    }
  }, [params.q]);

  const handleSearch = (searchParams: string) => {
    const parsedParams = queryString.parse(searchParams);
    const { q, t } = parsedParams;
    if (q) {
      props.fetchSearchResults(q as string, t as string);
      setParams(parsedParams as any);
      setSearchInputValue(q as string);
      setIsSearching(true);
    }
  };

  const onSearch = (value: string) => {
    if (value) {
      history.push(router.SEARCH_RESULTS.dynamicRoute({ q: value }));
    }
  };

  const onTabChange = (key: string) => {
    const newParams = { q: params.q || "", t: key };
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

  const renderMineResult = (item: any) => {
    const mineStatus =
      item.result.mine_status && item.result.mine_status.length > 0
        ? item.result.mine_status[0].status_labels
        : null;

    return (
      <ResultCard
        icon={<EnvironmentOutlined />}
        iconClass="card-icon--mine"
        title={item.result.mine_name}
        link={router.MINE_DASHBOARD.dynamicRoute(item.result.mine_guid)}
        highlightRegex={highlightRegex}
        actions={[
          <Link to={router.MINE_DASHBOARD.dynamicRoute(item.result.mine_guid)} key="view">
            <Button type="link" size="small" icon={<EyeOutlined />}>
              Dashboard
            </Button>
          </Link>,
          <Link
            to={router.MINE_HOME_PAGE.mapRoute({
              lat: item.result.latitude,
              long: item.result.longitude,
              zoom: 10,
              mineName: item.result.mine_name,
            })}
            key="map"
          >
            <Button type="link" size="small" icon={<EnvironmentOutlined />}>
              Map
            </Button>
          </Link>,
        ]}
      >
        <Space split={<span style={{ color: "#d9d9d9" }}>•</span>}>
          <Text type="secondary">
            {highlightRegex ? (
              <Highlight search={highlightRegex}>{item.result.mine_no ?? ""}</Highlight>
            ) : (
              item.result.mine_no
            )}
          </Text>
          <Text type="secondary">{item.result.mine_region}</Text>
          {mineStatus && <StatusTag status={mineStatus} />}
        </Space>
      </ResultCard>
    );
  };

  const renderPartyResult = (item: any) => (
    <ResultCard
      icon={<TeamOutlined />}
      iconClass="card-icon--party"
      title={item.result.name}
      link={router.PARTY_PROFILE.dynamicRoute(item.result.party_guid)}
      highlightRegex={highlightRegex}
      actions={[
        <Link to={router.PARTY_PROFILE.dynamicRoute(item.result.party_guid)} key="view">
          <Button type="link" size="small" icon={<EyeOutlined />}>
            Profile
          </Button>
        </Link>,
      ]}
    >
      <Space split={<span style={{ color: "#d9d9d9" }}>•</span>}>
        {item.result.email && <Text type="secondary">{item.result.email}</Text>}
        {item.result.phone_no && <Text type="secondary">{item.result.phone_no}</Text>}
        {item.result.mine_party_appt && item.result.mine_party_appt.length > 0 && (
          <Tag>{item.result.mine_party_appt[0].mine_party_appt_type_code_description}</Tag>
        )}
      </Space>
    </ResultCard>
  );

  const renderPermitResult = (item: any) => (
    <ResultCard
      icon={<FileProtectOutlined />}
      iconClass="card-icon--permit"
      title={`Permit: ${item.result.permit_no}`}
      link={router.VIEW_MINE_PERMIT.dynamicRoute(
        item.result.mine[0].mine_guid,
        item.result.permit_guid
      )}
      highlightRegex={highlightRegex}
      actions={[
        <Link
          to={router.VIEW_MINE_PERMIT.dynamicRoute(
            item.result.mine[0].mine_guid,
            item.result.permit_guid
          )}
          key="view"
        >
          <Button type="link" size="small" icon={<EyeOutlined />}>
            View Permit
          </Button>
        </Link>,
      ]}
    >
      <Space split={<span style={{ color: "#d9d9d9" }}>•</span>}>
        <Text type="secondary">{item.result.mine[0].mine_name}</Text>
        <StatusTag status={item.result.permit_status_code} />
      </Space>
    </ResultCard>
  );

  const renderDocumentResult = (item: any) => (
    <Card hoverable className="search-result-card">
      <Row gutter={16} align="middle" wrap={false}>
        <Col flex="none">
          <div className="card-icon card-icon--document">
            <FileTextOutlined />
          </div>
        </Col>
        <Col flex="auto" style={{ minWidth: 0 }}>
          <DocumentLink
            documentManagerGuid={item.result.document_manager_guid}
            documentName={item.result.document_name}
            truncateDocumentName={false}
            linkTitleOverride={
              highlightRegex ? (
                <Highlight search={highlightRegex}>{item.result.document_name ?? ""}</Highlight>
              ) : undefined
            }
          />
          <div className="card-meta">
            <Space split={<span style={{ color: "#d9d9d9" }}>•</span>}>
              <Text type="secondary">{item.result.mine_name}</Text>
              <Text type="secondary">Uploaded {formatDate(item.result.upload_date)}</Text>
            </Space>
          </div>
        </Col>
      </Row>
    </Card>
  );

  const renderContent = () => {
    if (isSearching && !props.hideLoadingIndicator) return <SearchSkeleton />;

    const allResults = [
      ...(props.searchResults.mine || []),
      ...(props.searchResults.party || []),
      ...(props.searchResults.permit || []),
      ...(props.searchResults.mine_documents || []),
      ...(props.searchResults.permit_documents || []),
    ].sort((a, b) => b.score - a.score);

    if (allResults.length === 0 && !isSearching) {
      return (
        <Empty
          description={
            <span>
              No results found for "<strong>{params.q}</strong>"
            </span>
          }
          style={{ padding: 48 }}
        >
          <Button type="primary" onClick={() => history.push(router.HOME_PAGE.route)}>
            Back to Home
          </Button>
        </Empty>
      );
    }

    const filteredResults = allResults.filter((item) => {
      const result = item.result as any;
      if (item.type === "mine") {
        // Mine Region filter
        if (selectedFilters.mine_region && selectedFilters.mine_region.length > 0) {
          if (!selectedFilters.mine_region.includes(result.mine_region)) return false;
        }
        // Mine Classification filter (Major/Regional)
        if (selectedFilters.mine_classification && selectedFilters.mine_classification.length > 0) {
          const classification = result.major_mine_ind ? "Major Mine" : "Regional Mine";
          if (!selectedFilters.mine_classification.includes(classification)) return false;
        }
        // Mine Operation Status filter
        if (selectedFilters.mine_operation_status && selectedFilters.mine_operation_status.length > 0) {
          const statusCode =
            result.mine_status && result.mine_status.length > 0
              ? result.mine_status[0].status_values?.[0]
              : null;
          if (!statusCode || !selectedFilters.mine_operation_status.includes(statusCode)) return false;
        }
        // Mine Tenure filter
        if (selectedFilters.mine_tenure && selectedFilters.mine_tenure.length > 0) {
          const tenures = result.mine_type
            ? result.mine_type.map((mt: any) => mt.mine_tenure_type_code)
            : [];
          if (!selectedFilters.mine_tenure.some((t) => tenures.includes(t))) return false;
        }
        // Mine Commodity filter
        if (selectedFilters.mine_commodity && selectedFilters.mine_commodity.length > 0) {
          const commodities = result.mine_type
            ? result.mine_type.flatMap((mt: any) =>
                mt.mine_type_detail
                  ? mt.mine_type_detail.map((mtd: any) => mtd.mine_commodity_code)
                  : []
              )
            : [];
          if (!selectedFilters.mine_commodity.some((c) => commodities.includes(c))) return false;
        }
        // TSF filter
        if (selectedFilters.has_tsf && selectedFilters.has_tsf.length > 0) {
          const tsf =
            result.mine_tailings_storage_facilities &&
            result.mine_tailings_storage_facilities.length > 0
              ? "Has TSF"
              : "No TSF";
          if (!selectedFilters.has_tsf.includes(tsf)) return false;
        }
        // Verified Status filter
        if (selectedFilters.verified_status && selectedFilters.verified_status.length > 0) {
          const verified = result.verified_status
            ? result.verified_status.healthy_ind
              ? "Verified"
              : "Unverified"
            : null;
          if (!verified || !selectedFilters.verified_status.includes(verified)) return false;
        }
      }
      if (item.type === "permit") {
        if (selectedFilters.permit_status && selectedFilters.permit_status.length > 0) {
          if (!selectedFilters.permit_status.includes(result.permit_status_code)) return false;
        }
      }
      return true;
    });

    const activeTab = params.t || "all";
    const hasActiveFilters = Object.keys(selectedFilters).length > 0;

    // Convert API facets (array format) to Record format for consistency
    const apiFacetToRecord = (apiFacet: FacetBucket[] | undefined): Record<string, number> => {
      if (!apiFacet) return {};
      return apiFacet.reduce((acc, bucket) => {
        acc[bucket.key] = bucket.count;
        return acc;
      }, {} as Record<string, number>);
    };

    // Use ES-powered API facets for all filters
    const facetConfig = [
      { key: "mine_region", label: "Mine Region", data: apiFacetToRecord(props.searchFacets?.mine_region) },
      { key: "mine_classification", label: "Classification", data: apiFacetToRecord(props.searchFacets?.mine_classification) },
      { key: "mine_operation_status", label: "Operation Status", data: apiFacetToRecord(props.searchFacets?.mine_operation_status) },
      { key: "mine_tenure", label: "Mine Tenure", data: apiFacetToRecord(props.searchFacets?.mine_tenure) },
      { key: "mine_commodity", label: "Commodity", data: apiFacetToRecord(props.searchFacets?.mine_commodity) },
      { key: "has_tsf", label: "TSF", data: apiFacetToRecord(props.searchFacets?.has_tsf) },
      { key: "verified_status", label: "Verified", data: apiFacetToRecord(props.searchFacets?.verified_status) },
      { key: "permit_status", label: "Permit Status", data: apiFacetToRecord(props.searchFacets?.permit_status) },
    ].filter((f) => Object.keys(f.data).length > 0);

    const renderActiveFilters = () => {
      if (!hasActiveFilters) return null;
      const allFilters: { category: string; value: string; label: string }[] = [];
      Object.entries(selectedFilters).forEach(([category, values]) => {
        const config = facetConfig.find((f) => f.key === category);
        values.forEach((value) => {
          allFilters.push({
            category,
            value,
            label: `${config?.label || category}: ${value}`,
          });
        });
      });

      return (
        <div className="active-filters" style={{ marginBottom: 16 }}>
          <Space wrap>
            {allFilters.map((filter) => (
              <Tag
                key={`${filter.category}-${filter.value}`}
                closable
                onClose={() => removeFilter(filter.category, filter.value)}
                style={{
                  background: "rgba(94, 70, 161, 0.1)",
                  borderColor: "transparent",
                  color: "#5e46a1",
                  borderRadius: 16,
                  padding: "4px 12px",
                }}
              >
                {filter.label}
              </Tag>
            ))}
            <Button
              type="link"
              size="small"
              icon={<ClearOutlined />}
              onClick={clearAllFilters}
              style={{ color: "#8c8c8c" }}
            >
              Clear all
            </Button>
          </Space>
        </div>
      );
    };

    const renderFacets = () => (
      <div className="search-results-page__filters">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Title level={5} style={{ margin: 0 }}>
            <FilterOutlined style={{ marginRight: 8 }} />
            Filters
          </Title>
          {hasActiveFilters && (
            <Button type="link" size="small" onClick={clearAllFilters}>
              Clear
            </Button>
          )}
        </div>
        <Collapse
          defaultActiveKey={facetConfig.slice(0, 3).map((f) => f.key)}
          ghost
          expandIconPosition="end"
        >
          {facetConfig.map((facet) => (
            <Panel header={facet.label} key={facet.key}>
              {Object.entries(facet.data)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([value, count]) => (
                  <div key={value} style={{ marginBottom: 8 }}>
                    <Checkbox
                      checked={selectedFilters[facet.key]?.includes(value)}
                      onChange={(e) => handleFilterChange(facet.key, value, e.target.checked)}
                    >
                      <span style={{ fontSize: 13 }}>
                        {value}{" "}
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          ({count})
                        </Text>
                      </span>
                    </Checkbox>
                  </div>
                ))}
            </Panel>
          ))}
        </Collapse>
      </div>
    );

    const getFilteredByType = (type: string) => filteredResults.filter((item) => item.type === type);
    const getFilteredDocuments = () =>
      filteredResults.filter(
        (item) => item.type === "mine_documents" || item.type === "permit_documents"
      );

    const tabItems = [
      {
        key: "all",
        label: `All (${filteredResults.length})`,
        children: (
          <div>
            {renderActiveFilters()}
            <div className="results-header" style={{ marginBottom: 16 }}>
              <Text type="secondary">
                Showing <strong>{filteredResults.length}</strong> results for "
                <strong>{params.q}</strong>"
              </Text>
            </div>
            {filteredResults.map((item: any, index: number) => (
              <div key={`${item.type}-${index}`}>
                {item.type === "mine" && renderMineResult(item)}
                {item.type === "party" && renderPartyResult(item)}
                {item.type === "permit" && renderPermitResult(item)}
                {(item.type === "mine_documents" || item.type === "permit_documents") &&
                  renderDocumentResult(item)}
              </div>
            ))}
          </div>
        ),
      },
      {
        key: "mine",
        label: `Mines (${getFilteredByType("mine").length})`,
        children: (
          <div>
            {renderActiveFilters()}
            {getFilteredByType("mine").map((item, index) => (
              <div key={`mine-${index}`}>{renderMineResult(item)}</div>
            ))}
          </div>
        ),
      },
      {
        key: "party",
        label: `Contacts (${getFilteredByType("party").length})`,
        children: (
          <div>
            {renderActiveFilters()}
            {getFilteredByType("party").map((item, index) => (
              <div key={`party-${index}`}>{renderPartyResult(item)}</div>
            ))}
          </div>
        ),
      },
      {
        key: "permit",
        label: `Permits (${getFilteredByType("permit").length})`,
        children: (
          <div>
            {renderActiveFilters()}
            {getFilteredByType("permit").map((item, index) => (
              <div key={`permit-${index}`}>{renderPermitResult(item)}</div>
            ))}
          </div>
        ),
      },
      {
        key: "document",
        label: `Documents (${getFilteredDocuments().length})`,
        children: (
          <div>
            {renderActiveFilters()}
            {getFilteredDocuments().map((item, index) => (
              <div key={`doc-${index}`}>{renderDocumentResult(item)}</div>
            ))}
          </div>
        ),
      },
    ];

    return (
      <Row gutter={24}>
        <Col xs={24} lg={6}>
          {renderFacets()}
        </Col>
        <Col xs={24} lg={18}>
          <Tabs activeKey={activeTab} onChange={onTabChange} items={tabItems} size="large" />
        </Col>
      </Row>
    );
  };

  return (
    <div className="search-results-page">
      <div className="search-results-page__header">
        <Row justify="center">
          <Col xs={22} lg={16}>
            <Title level={2} className="search-title">
              Search Results
            </Title>
            <div className="search-input-wrapper">
              <Input.Search
                placeholder="Search for mines, contacts, permits, or documents..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                value={searchInputValue}
                onChange={(e) => setSearchInputValue(e.target.value)}
                onSearch={onSearch}
              />
            </div>
          </Col>
        </Row>
      </div>
      <div className="search-results-page__content">
        <Row justify="center">
          <Col xs={24} xl={20} xxl={18}>
            {renderContent()}
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
