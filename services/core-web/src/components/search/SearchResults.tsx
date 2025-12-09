import React, { useEffect, useState, useMemo } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { useLocation, useHistory, Link } from "react-router-dom";
import queryString from "query-string";
import { Input, Tabs, List, Card, Typography, Tag, Empty, Row, Col, Button, Space, Skeleton, Checkbox, Collapse } from "antd";
import { SearchOutlined, FileTextOutlined, TeamOutlined, EnvironmentOutlined, FileProtectOutlined, ArrowRightOutlined, EyeOutlined, FilterOutlined } from "@ant-design/icons";
import { getSearchResults, getSearchTerms } from "@mds/common/redux/selectors/searchSelectors";
import { fetchSearchOptions, fetchSearchResults } from "@mds/common/redux/actionCreators/searchActionCreator";
import { getSearchOptions } from "@mds/common/redux/reducers/searchReducer";
import * as router from "@/constants/routes";
import Loading from "@/components/common/Loading";
import Highlight from "react-highlighter";
import DocumentLink from "@mds/common/components/documents/DocumentLink";
import { ISearchResultList } from "@mds/common/interfaces";
import { formatDate } from "@common/utils/helpers";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;

interface SearchResultsProps {
  location: { search: string };
  history: { push: (path: string) => void };
  fetchSearchOptions: () => any;
  fetchSearchResults: (query: string, tab?: string) => any;
  searchOptions: any[];
  searchTerms: string[];
  searchResults: ISearchResultList;
  hideLoadingIndicator?: boolean;
}

type PropsFromRedux = SearchResultsProps;

const StatusTag = ({ status }: { status: string | string[] }) => {
  if (!status) return null;

  const statusText = Array.isArray(status) ? status.join(", ") : status;
  let color = "default";

  const lowerStatus = statusText.toLowerCase();
  if (lowerStatus.includes("operating") || lowerStatus.includes("open") || lowerStatus.includes("active")) {
    color = "success";
  } else if (lowerStatus.includes("closed")) {
    color = "error";
  } else if (lowerStatus.includes("care") || lowerStatus.includes("maintenance")) {
    color = "warning";
  }

  return <Tag color={color}>{statusText}</Tag>;
};

const SearchSkeleton = () => (
  <Card style={{ marginBottom: 16 }}>
    <Skeleton avatar active paragraph={{ rows: 2 }} />
  </Card>
);

const SearchResultCard = ({ title, icon, children, link, highlightRegex, actions = [] }) => (
  <Card hoverable className="search-result-card" style={{ marginBottom: 16 }} actions={actions}>
    <Row gutter={16} align="middle">
      <Col flex="50px" style={{ textAlign: "center" }}>
        <div style={{ fontSize: 24, color: "#1890ff" }}>{icon}</div>
      </Col>
      <Col flex="auto">
        <Link to={link}>
          <Title level={5} style={{ marginBottom: 4 }}>
            {highlightRegex ? (
              <Highlight search={highlightRegex}>{title ?? ""}</Highlight>
            ) : (
              title ?? ""
            )}
          </Title>
        </Link>
        {children}
      </Col>
      <Col>
        <Link to={link}>
          <Button type="text" icon={<ArrowRightOutlined />} />
        </Link>
      </Col>
    </Row>
  </Card>
);

export const SearchResults: React.FC<PropsFromRedux> = (props) => {
  const [isSearching, setIsSearching] = useState(false);
  const [params, setParams] = useState<{ [key: string]: string }>({});
  const history = useHistory();
  const location = useLocation();
  const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: string[] }>({});

  // Reset filters when search term changes
  useEffect(() => {
    setSelectedFilters({});
  }, [params.q]);

  const getFacets = (results: any[]) => {
    const facets = {
      mine_region: {},
      mine_status: {},
      mine_tenure: {},
      mine_commodity: {},
      mine_classification: {},
      mine_tsf: {},
      mine_work_status: {},
      mine_verified_status: {},
      permit_status: {}
    };

    results.forEach(item => {
      const result = item.result as any;
      if (item.type === 'mine') {
        if (result.mine_region) {
          facets.mine_region[result.mine_region] = (facets.mine_region[result.mine_region] || 0) + 1;
        }
        if (result.mine_status && result.mine_status.length > 0) {
          const status = result.mine_status[0].status_labels;
          if (status) {
            const statusStr = Array.isArray(status) ? status.join(", ") : status;
            facets.mine_status[statusStr] = (facets.mine_status[statusStr] || 0) + 1;
          }
        }
        // Tenure & Commodity
        if (result.mine_type) {
          result.mine_type.forEach((mt: any) => {
            if (mt.mine_tenure_type_code) {
              facets.mine_tenure[mt.mine_tenure_type_code] = (facets.mine_tenure[mt.mine_tenure_type_code] || 0) + 1;
            }
            if (mt.mine_type_detail) {
              mt.mine_type_detail.forEach((mtd: any) => {
                if (mtd.mine_commodity_code) {
                  facets.mine_commodity[mtd.mine_commodity_code] = (facets.mine_commodity[mtd.mine_commodity_code] || 0) + 1;
                }
              });
            }
          });
        }
        // Classification
        const classification = result.major_mine_ind ? "Major Mine" : "Regional Mine";
        facets.mine_classification[classification] = (facets.mine_classification[classification] || 0) + 1;

        // TSF
        const tsf = result.mine_tailings_storage_facilities && result.mine_tailings_storage_facilities.length > 0 ? "Has TSF" : "No TSF";
        facets.mine_tsf[tsf] = (facets.mine_tsf[tsf] || 0) + 1;

        // Work Status
        if (result.mine_work_information && result.mine_work_information.work_status) {
          facets.mine_work_status[result.mine_work_information.work_status] = (facets.mine_work_status[result.mine_work_information.work_status] || 0) + 1;
        }

        // Verified Status
        if (result.verified_status) {
          const verified = result.verified_status.healthy_ind ? "Verified" : "Unverified";
          facets.mine_verified_status[verified] = (facets.mine_verified_status[verified] || 0) + 1;
        }
      }
      if (item.type === 'permit') {
        if (result.permit_status_code) {
          facets.permit_status[result.permit_status_code] = (facets.permit_status[result.permit_status_code] || 0) + 1;
        }
      }
    });
    return facets;
  }; const handleFilterChange = (category: string, value: string, checked: boolean) => {
    setSelectedFilters(prev => {
      const current = prev[category] || [];
      if (checked) {
        return { ...prev, [category]: [...current, value] };
      } else {
        const newCategory = current.filter(v => v !== value);
        if (newCategory.length === 0) {
          const { [category]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [category]: newCategory };
      }
    });
  };

  const highlightRegex = useMemo(() => {
    if (!params.q) return null;
    // Escape special characters in the search term
    const escapedTerm = params.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
      return new RegExp(escapedTerm, 'i');
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
    const mineStatus = item.result.mine_status && item.result.mine_status.length > 0
      ? item.result.mine_status[0].status_labels
      : null;

    return (
      <SearchResultCard
        title={item.result.mine_name}
        icon={<EnvironmentOutlined />}
        link={router.MINE_DASHBOARD.dynamicRoute(item.result.mine_guid)}
        highlightRegex={highlightRegex}
        actions={[
          <Link to={router.MINE_DASHBOARD.dynamicRoute(item.result.mine_guid)} key="view">
            <Button type="link" icon={<EyeOutlined />}>View Dashboard</Button>
          </Link>,
          <Link to={router.MINE_HOME_PAGE.mapRoute({ lat: item.result.latitude, long: item.result.longitude, zoom: 10, mineName: item.result.mine_name })} key="map">
            <Button type="link" icon={<EnvironmentOutlined />}>View on Map</Button>
          </Link>
        ]}
      >
        <Space direction="vertical" size={0} style={{ width: '100%' }}>
          <Row justify="space-between">
            <Col>
              <Text type="secondary">
                Mine No:{" "}
                {highlightRegex ? (
                  <Highlight search={highlightRegex}>{item.result.mine_no ?? ""}</Highlight>
                ) : (
                  item.result.mine_no ?? ""
                )}
              </Text>
            </Col>
            <Col>
              <StatusTag status={mineStatus} />
            </Col>
          </Row>
          {item.result.mms_alias && (
            <Text type="secondary">
              Alias:{" "}
              {highlightRegex ? (
                <Highlight search={highlightRegex}>{item.result.mms_alias ?? ""}</Highlight>
              ) : (
                item.result.mms_alias ?? ""
              )}
            </Text>
          )}
          <Text type="secondary">Region: {item.result.mine_region}</Text>
        </Space>
      </SearchResultCard>
    );
  };

  const renderPartyResult = (item: any) => (
    <SearchResultCard
      title={item.result.name}
      icon={<TeamOutlined />}
      link={router.PARTY_PROFILE.dynamicRoute(item.result.party_guid)}
      highlightRegex={highlightRegex}
      actions={[
        <Link to={router.PARTY_PROFILE.dynamicRoute(item.result.party_guid)} key="view">
          <Button type="link" icon={<EyeOutlined />}>View Profile</Button>
        </Link>
      ]}
    >
      <Space direction="vertical" size={0}>
        <Text type="secondary">
          Email:{" "}
          {highlightRegex ? (
            <Highlight search={highlightRegex}>{item.result.email ?? ""}</Highlight>
          ) : (
            item.result.email ?? ""
          )}
        </Text>
        <Text type="secondary">
          Phone:{" "}
          {highlightRegex ? (
            <Highlight search={highlightRegex}>{item.result.phone_no ?? ""}</Highlight>
          ) : (
            item.result.phone_no ?? ""
          )}
        </Text>
        {item.result.mine_party_appt && item.result.mine_party_appt.length > 0 && (
          <Text type="secondary">Role: {item.result.mine_party_appt[0].mine_party_appt_type_code_description}</Text>
        )}
      </Space>
    </SearchResultCard>
  );

  const renderPermitResult = (item: any) => (
    <SearchResultCard
      title={`Permit: ${item.result.permit_no}`}
      icon={<FileProtectOutlined />}
      link={router.VIEW_MINE_PERMIT.dynamicRoute(item.result.mine[0].mine_guid, item.result.permit_guid)}
      highlightRegex={highlightRegex}
      actions={[
        <Link to={router.VIEW_MINE_PERMIT.dynamicRoute(item.result.mine[0].mine_guid, item.result.permit_guid)} key="view">
          <Button type="link" icon={<EyeOutlined />}>View Permit</Button>
        </Link>
      ]}
    >
      <Space direction="vertical" size={0} style={{ width: '100%' }}>
        <Row justify="space-between">
          <Col>
            <Text type="secondary">Mine: {item.result.mine[0].mine_name}</Text>
          </Col>
          <Col>
            <StatusTag status={item.result.permit_status_code} />
          </Col>
        </Row>
      </Space>
    </SearchResultCard>
  );

  const renderDocumentResult = (item: any) => (
    <Card hoverable className="search-result-card" style={{ marginBottom: 16 }}>
      <Row gutter={16} align="middle">
        <Col flex="50px" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 24, color: "#1890ff" }}><FileTextOutlined /></div>
        </Col>
        <Col flex="auto">
          <Title level={5} style={{ marginBottom: 4 }}>
            <DocumentLink
              documentManagerGuid={item.result.document_manager_guid}
              documentName={item.result.document_name}
              truncateDocumentName={false}
              linkTitleOverride={highlightRegex ? <Highlight search={highlightRegex}>{item.result.document_name ?? ""}</Highlight> : undefined}
            />
          </Title>
          <Space direction="vertical" size={0}>
            <Text type="secondary">Mine: {item.result.mine_name}</Text>
            <Text type="secondary">Uploaded: {formatDate(item.result.upload_date)}</Text>
          </Space>
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
      ...(props.searchResults.permit_documents || [])
    ].sort((a, b) => b.score - a.score);

    if (allResults.length === 0 && !isSearching) {
      return <Empty description="No results found" />;
    }

    const facets = getFacets(allResults);

    const filteredResults = allResults.filter(item => {
      const result = item.result as any;
      if (item.type === 'mine') {
        if (selectedFilters.mine_region && selectedFilters.mine_region.length > 0) {
          if (!selectedFilters.mine_region.includes(result.mine_region)) return false;
        }
        if (selectedFilters.mine_status && selectedFilters.mine_status.length > 0) {
          const status = result.mine_status && result.mine_status.length > 0 ? result.mine_status[0].status_labels : null;
          const statusStr = Array.isArray(status) ? status.join(", ") : status;
          if (!selectedFilters.mine_status.includes(statusStr)) return false;
        }
        if (selectedFilters.mine_tenure && selectedFilters.mine_tenure.length > 0) {
          const tenures = result.mine_type ? result.mine_type.map((mt: any) => mt.mine_tenure_type_code) : [];
          if (!selectedFilters.mine_tenure.some(t => tenures.includes(t))) return false;
        }
        if (selectedFilters.mine_commodity && selectedFilters.mine_commodity.length > 0) {
          const commodities = result.mine_type ? result.mine_type.flatMap((mt: any) => mt.mine_type_detail ? mt.mine_type_detail.map((mtd: any) => mtd.mine_commodity_code) : []) : [];
          if (!selectedFilters.mine_commodity.some(c => commodities.includes(c))) return false;
        }
        if (selectedFilters.mine_classification && selectedFilters.mine_classification.length > 0) {
          const classification = result.major_mine_ind ? "Major Mine" : "Regional Mine";
          if (!selectedFilters.mine_classification.includes(classification)) return false;
        }
        if (selectedFilters.mine_tsf && selectedFilters.mine_tsf.length > 0) {
          const tsf = result.mine_tailings_storage_facilities && result.mine_tailings_storage_facilities.length > 0 ? "Has TSF" : "No TSF";
          if (!selectedFilters.mine_tsf.includes(tsf)) return false;
        }
        if (selectedFilters.mine_work_status && selectedFilters.mine_work_status.length > 0) {
          const ws = result.mine_work_information ? result.mine_work_information.work_status : null;
          if (!ws || !selectedFilters.mine_work_status.includes(ws)) return false;
        }
        if (selectedFilters.mine_verified_status && selectedFilters.mine_verified_status.length > 0) {
          const verified = result.verified_status ? (result.verified_status.healthy_ind ? "Verified" : "Unverified") : null;
          if (!verified || !selectedFilters.mine_verified_status.includes(verified)) return false;
        }
      }

      if (item.type === 'permit') {
        if (selectedFilters.permit_status && selectedFilters.permit_status.length > 0) {
          if (!selectedFilters.permit_status.includes(result.permit_status_code)) return false;
        }
      }
      return true;
    });

    const activeTab = params.t || "all";

    const renderFacets = () => (
      <div style={{ marginRight: 24 }}>
        <Title level={5}><FilterOutlined /> Filters</Title>
        <Collapse defaultActiveKey={['1', '2', '3', '4', '5', '6', '7', '8', '9']} ghost>
          {Object.keys(facets.mine_region).length > 0 && (
            <Panel header="Mine Region" key="1">
              {Object.entries(facets.mine_region).map(([region, count]) => (
                <div key={region}>
                  <Checkbox
                    checked={selectedFilters.mine_region?.includes(region)}
                    onChange={(e) => handleFilterChange('mine_region', region, e.target.checked)}
                  >
                    {region} ({count})
                  </Checkbox>
                </div>
              ))}
            </Panel>
          )}
          {Object.keys(facets.mine_status).length > 0 && (
            <Panel header="Mine Status" key="2">
              {Object.entries(facets.mine_status).map(([status, count]) => (
                <div key={status}>
                  <Checkbox
                    checked={selectedFilters.mine_status?.includes(status)}
                    onChange={(e) => handleFilterChange('mine_status', status, e.target.checked)}
                  >
                    {status} ({count})
                  </Checkbox>
                </div>
              ))}
            </Panel>
          )}
          {Object.keys(facets.mine_tenure).length > 0 && (
            <Panel header="Mine Tenure" key="4">
              {Object.entries(facets.mine_tenure).map(([tenure, count]) => (
                <div key={tenure}>
                  <Checkbox
                    checked={selectedFilters.mine_tenure?.includes(tenure)}
                    onChange={(e) => handleFilterChange('mine_tenure', tenure, e.target.checked)}
                  >
                    {tenure} ({count})
                  </Checkbox>
                </div>
              ))}
            </Panel>
          )}
          {Object.keys(facets.mine_commodity).length > 0 && (
            <Panel header="Mine Commodity" key="5">
              {Object.entries(facets.mine_commodity).map(([commodity, count]) => (
                <div key={commodity}>
                  <Checkbox
                    checked={selectedFilters.mine_commodity?.includes(commodity)}
                    onChange={(e) => handleFilterChange('mine_commodity', commodity, e.target.checked)}
                  >
                    {commodity} ({count})
                  </Checkbox>
                </div>
              ))}
            </Panel>
          )}
          {Object.keys(facets.mine_classification).length > 0 && (
            <Panel header="Mine Classification" key="6">
              {Object.entries(facets.mine_classification).map(([classification, count]) => (
                <div key={classification}>
                  <Checkbox
                    checked={selectedFilters.mine_classification?.includes(classification)}
                    onChange={(e) => handleFilterChange('mine_classification', classification, e.target.checked)}
                  >
                    {classification} ({count})
                  </Checkbox>
                </div>
              ))}
            </Panel>
          )}
          {Object.keys(facets.mine_tsf).length > 0 && (
            <Panel header="TSF Criteria" key="7">
              {Object.entries(facets.mine_tsf).map(([tsf, count]) => (
                <div key={tsf}>
                  <Checkbox
                    checked={selectedFilters.mine_tsf?.includes(tsf)}
                    onChange={(e) => handleFilterChange('mine_tsf', tsf, e.target.checked)}
                  >
                    {tsf} ({count})
                  </Checkbox>
                </div>
              ))}
            </Panel>
          )}
          {Object.keys(facets.mine_work_status).length > 0 && (
            <Panel header="Work Status" key="8">
              {Object.entries(facets.mine_work_status).map(([status, count]) => (
                <div key={status}>
                  <Checkbox
                    checked={selectedFilters.mine_work_status?.includes(status)}
                    onChange={(e) => handleFilterChange('mine_work_status', status, e.target.checked)}
                  >
                    {status} ({count})
                  </Checkbox>
                </div>
              ))}
            </Panel>
          )}
          {Object.keys(facets.mine_verified_status).length > 0 && (
            <Panel header="Verified Status" key="9">
              {Object.entries(facets.mine_verified_status).map(([status, count]) => (
                <div key={status}>
                  <Checkbox
                    checked={selectedFilters.mine_verified_status?.includes(status)}
                    onChange={(e) => handleFilterChange('mine_verified_status', status, e.target.checked)}
                  >
                    {status} ({count})
                  </Checkbox>
                </div>
              ))}
            </Panel>
          )}
          {Object.keys(facets.permit_status).length > 0 && (
            <Panel header="Permit Status" key="3">
              {Object.entries(facets.permit_status).map(([status, count]) => (
                <div key={status}>
                  <Checkbox
                    checked={selectedFilters.permit_status?.includes(status)}
                    onChange={(e) => handleFilterChange('permit_status', status, e.target.checked)}
                  >
                    {status} ({count})
                  </Checkbox>
                </div>
              ))}
            </Panel>
          )}
        </Collapse>
      </div>
    );

    const getFilteredByType = (type: string) => filteredResults.filter(item => item.type === type);
    const getFilteredDocuments = () => filteredResults.filter(item => item.type === 'mine_documents' || item.type === 'permit_documents');

    return (
      <Row>
        <Col span={6}>
          {renderFacets()}
        </Col>
        <Col span={18}>
          <Tabs activeKey={activeTab} onChange={onTabChange} size="large">
            <TabPane tab={`All (${filteredResults.length})`} key="all">
              <List
                itemLayout="vertical"
                dataSource={filteredResults}
                pagination={{ pageSize: 10 }}
                renderItem={(item: any) => {
                  if (item.type === "mine") return renderMineResult(item);
                  if (item.type === "party") return renderPartyResult(item);
                  if (item.type === "permit") return renderPermitResult(item);
                  if (item.type === "mine_documents" || item.type === "permit_documents") return renderDocumentResult(item);
                  return null;
                }}
              />
            </TabPane>
            <TabPane tab={`Mines (${getFilteredByType('mine').length})`} key="mine">
              <List
                dataSource={getFilteredByType('mine')}
                pagination={{ pageSize: 10 }}
                renderItem={renderMineResult}
              />
            </TabPane>
            <TabPane tab={`Contacts (${getFilteredByType('party').length})`} key="party">
              <List
                dataSource={getFilteredByType('party')}
                pagination={{ pageSize: 10 }}
                renderItem={renderPartyResult}
              />
            </TabPane>
            <TabPane tab={`Permits (${getFilteredByType('permit').length})`} key="permit">
              <List
                dataSource={getFilteredByType('permit')}
                pagination={{ pageSize: 10 }}
                renderItem={renderPermitResult}
              />
            </TabPane>
            <TabPane tab={`Documents (${getFilteredDocuments().length})`} key="document">
              <List
                dataSource={getFilteredDocuments()}
                pagination={{ pageSize: 10 }}
                renderItem={renderDocumentResult}
              />
            </TabPane>
          </Tabs>
        </Col>
      </Row>
    );
  };

  return (
    <div className="landing-page">
      <div className="landing-page__header">
        <Row justify="center">
          <Col span={18}>
            <Title level={2} style={{ textAlign: "center", marginBottom: 32 }}>Search & Exploration</Title>
            <Input.Search
              placeholder="Search for mines, contacts, permits, or documents..."
              allowClear
              enterButton="Search"
              size="large"
              onSearch={onSearch}
              defaultValue={params.q}
              style={{ marginBottom: 32 }}
            />
          </Col>
        </Row>
      </div>
      <div className="landing-page__content">
        <Row justify="center">
          <Col span={22}>
            {renderContent()}
          </Col>
        </Row>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  searchOptions: getSearchOptions(state),
  searchResults: getSearchResults(state),
  searchTerms: getSearchTerms(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchSearchOptions,
      fetchSearchResults,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(SearchResults);
