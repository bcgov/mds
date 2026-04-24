import React, { useEffect, useState } from 'react';
import { Layout, Typography, Row, Col, Card, Skeleton, Button, Tooltip } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@mds/common/redux/rootState';
import {
  searchNowApplicationDocuments,
  indexNowApplicationDocuments,
  selectNowSearchResults,
  selectNowSearchLoading,
  selectNowSearchQuery,
  selectNowSearchFilters,
  selectNowAiLoading,
  selectNowDocumentLoading,
  selectNowIndexing,
  selectNowAllFacets,
} from '@mds/common/redux/slices/nowApplicationSearchSlice';
import { debounce } from 'lodash';
import { change } from '@mds/common/components/forms/form';
import { FORM } from '@mds/common/constants/forms';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExpand, faCompress } from '@fortawesome/pro-solid-svg-icons';
import FormWrapper from '@mds/common/components/forms/FormWrapper';

// Reuse the existing search UI sub-components from Permit Search — they are
// generic enough to work for any document search backed by the same SSE contract.
import SearchBox from '@/components/mine/Permit/Search/components/SearchBox';
import SearchResults, {
  SelectedFilter,
} from '@/components/mine/Permit/Search/components/SearchResults';
import MarkdownViewer from '@/components/mine/Permit/Search/components/MarkdownViewer';
import PermitConditionSearchSplashScreen from '@/components/mine/Permit/Search/components/PermitConditionSearchSplashScreen';

interface NowApplicationDocumentSearchProps {
  nowApplicationGuid: string;
}

/**
 * Document search UI for a Notice of Work application.
 *
 * Structurally mirrors PermitConditionSearch but is scoped to a single NoW application:
 *   - Uses the nowApplicationSearch Redux slice (separate state namespace)
 *   - Passes nowApplicationGuid to every search thunk dispatch
 *   - Reuses all existing Permit Search sub-components (SearchBox, SearchResults,
 *     FilterDrawer, ResultItem, MarkdownViewer) — they are UI-agnostic
 *
 * The isolation guarantee lives in the backend. This component never passes
 * nowApplicationGuid as a filter to the query body — it goes in the URL path only.
 */
const NowApplicationDocumentSearch: React.FC<NowApplicationDocumentSearchProps> = ({
  nowApplicationGuid,
}) => {
  const dispatch = useAppDispatch();
  const results = useAppSelector(selectNowSearchResults);
  const loading = useAppSelector(selectNowSearchLoading);
  const aiLoading = useAppSelector(selectNowAiLoading);
  const indexing = useAppSelector(selectNowIndexing);
  const query = useAppSelector(selectNowSearchQuery);
  const selectedFilters = useAppSelector(selectNowSearchFilters);
  const [isAIResponseExpanded, setIsAIResponseExpanded] = useState(false);

  const hasActiveSearch = query || selectedFilters?.length > 0;
  const shouldShowSplash = !hasActiveSearch && !loading;

  const performSearch = (searchQuery: string, filters: SelectedFilter[]) => {
    dispatch(
      searchNowApplicationDocuments({
        nowApplicationGuid,
        query: searchQuery,
        filters,
      })
    );
  };

  const debouncedSearch = debounce(performSearch, 300);

  useEffect(() => {
    dispatch(change(FORM.NOW_APPLICATION_DOCUMENT_SEARCH, 'search', query));
  }, [query]);

  return (
    <Layout className="permit-search__layout">
      <Layout.Content className="permit-search__content">
        {shouldShowSplash ? (
          <PermitConditionSearchSplashScreen
            onSearch={(q) => debouncedSearch(q, selectedFilters)}
            loading={loading}
          />
        ) : (
          <Row gutter={[16, 24]} style={{ width: '100%' }}>
            <Col span={24}>
              <Row justify="space-between" align="middle">
                <Col>
                  <Typography.Title level={1} style={{ marginBottom: 0 }}>
                    Application Document Search
                  </Typography.Title>
                </Col>
                <Col>
                  <Tooltip title="Download and index all application documents to make them searchable. Safe to re-run.">
                    <Button
                      icon={<SyncOutlined spin={indexing} />}
                      loading={indexing}
                      onClick={() => dispatch(indexNowApplicationDocuments(nowApplicationGuid))}
                    >
                      Index Documents
                    </Button>
                  </Tooltip>
                </Col>
              </Row>
            </Col>
            <Col span={24}>
              <SearchBox
                onSearch={(q) => debouncedSearch(q, selectedFilters)}
                loading={loading}
              />
            </Col>
            <Col span={24}>
              <Row className="permit-search__results-container" gutter={[16, 0]}>
                <Col span={isAIResponseExpanded ? 8 : 16}>
                  <SearchResults
                    onFilterChange={(filters) => debouncedSearch(query, filters)}
                    selectors={{
                      selectResults: selectNowSearchResults,
                      selectFilters: selectNowSearchFilters,
                      selectQuery: selectNowSearchQuery,
                      selectDocumentLoading: selectNowDocumentLoading,
                      selectAllFacets: selectNowAllFacets,
                    }}
                  />
                </Col>
                <Col span={isAIResponseExpanded ? 16 : 8}>
                  <Card
                    title="AI-Generated Response"
                    loading={false}
                    className={`permit-search__ai-response ${
                      isAIResponseExpanded ? 'permit-search__ai-response--expanded' : ''
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={isAIResponseExpanded ? faCompress : faExpand}
                      onClick={() => setIsAIResponseExpanded(!isAIResponseExpanded)}
                      className="expand-button"
                      titleId="expand-button"
                      title={isAIResponseExpanded ? 'Compress' : 'Expand'}
                    />
                    {aiLoading ? (
                      <Skeleton active paragraph={{ rows: 3 }} />
                    ) : (
                      results?.prompt?.answers?.map((answer) => (
                        <MarkdownViewer
                          key={`prompt-${answer.substring(0, 20)}`}
                          markdown={answer}
                        />
                      ))
                    )}
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        )}
      </Layout.Content>
    </Layout>
  );
};

const NowApplicationDocumentSearchForm: React.FC<NowApplicationDocumentSearchProps> = (
  props
) => (
  <FormWrapper name={FORM.NOW_APPLICATION_DOCUMENT_SEARCH} onSubmit={() => {}}>
    <NowApplicationDocumentSearch {...props} />
  </FormWrapper>
);

export default NowApplicationDocumentSearchForm;
